import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const type = searchParams.get('type');
    const db = getAdminDb();
    
    if (type === 'full') {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session')?.value;
      if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      let decodedClaims;
      try {
        decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
      }

      const email = searchParams.get('email');
      const userId = searchParams.get('userId');
      
      // If a non-admin tries to fetch all bookings, block them
      if (!userId && !email && !decodedClaims.admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // If a non-admin tries to fetch someone else's bookings, block them
      if (!decodedClaims.admin && (userId !== decodedClaims.uid && email !== decodedClaims.email)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (userId && email) {
        const lowerEmail = email.toLowerCase().trim();
        const promises = [
          db.collection('bookings').where('userId', '==', userId).get(),
          db.collection('bookings').where('email', '==', email).get()
        ];
        
        // If they differ, query both so we catch old mixed-case guest bookings
        if (email !== lowerEmail) {
          promises.push(db.collection('bookings').where('email', '==', lowerEmail).get());
        }
        
        const guestRefs = searchParams.get('guestRefs');
        if (guestRefs) {
          const refs = guestRefs.split(',').filter(Boolean).slice(0, 10);
          if (refs.length > 0) {
            promises.push(db.collection('bookings').where('ref', 'in', refs).get());
          }
        }

        const snaps = await Promise.all(promises);
        
        const bookingMap = new Map();
        
        // Add all bookings found by userId
        snaps[0].docs.forEach(doc => bookingMap.set(doc.id, { id: doc.id, ...doc.data() }));
        
        // Add and auto-link bookings found by email that don't have a userId yet
        for (const snap of snaps.slice(1)) { // Skip the first one which is userIdSnap
          for (const doc of snap.docs) {
            const data = doc.data();
            bookingMap.set(doc.id, { id: doc.id, ...data });
            
            // Auto-link guest bookings to the current user's ID permanently
            if (!data.userId && userId) {
              try {
                await db.collection('bookings').doc(doc.id).update({ userId });
              } catch (e) {
                console.error('Failed to auto-link booking', e);
              }
            }
          }
        }
        
        const bookings = Array.from(bookingMap.values());
        return NextResponse.json(bookings, { status: 200 });
      } else if (userId) {
        const promises = [
          db.collection('bookings').where('userId', '==', userId).get()
        ];
        
        const guestRefs = searchParams.get('guestRefs');
        if (guestRefs) {
          const refs = guestRefs.split(',').filter(Boolean).slice(0, 10);
          if (refs.length > 0) {
            promises.push(db.collection('bookings').where('ref', 'in', refs).get());
          }
        }
        
        const snaps = await Promise.all(promises);
        const bookingMap = new Map();
        
        snaps.forEach(snap => {
          snap.docs.forEach(doc => {
            const data = doc.data();
            bookingMap.set(doc.id, { id: doc.id, ...data });
            
            // Auto-link guest bookings to the current user's ID permanently
            if (!data.userId) {
              try {
                db.collection('bookings').doc(doc.id).update({ userId });
              } catch (e) {}
            }
          });
        });
        
        return NextResponse.json(Array.from(bookingMap.values()), { status: 200 });
      } else if (email) {
        const snapshot = await db.collection('bookings').where('email', '==', email).get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(bookings, { status: 200 });
      } else {
        const snapshot = await db.collection('bookings').get();
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(bookings, { status: 200 });
      }
    }
    
    if (dateParam) {
      // Fetch for specific date
      const snapshot = await db.collection('bookings')
        .where('date', '==', dateParam)
        .get();
        
      const bookedTimes = snapshot.docs
        .map(doc => doc.data())
        .filter(data => data.status !== 'CANCELLED')
        .map(data => data.time);
        
      return NextResponse.json({ bookedTimes }, { status: 200 });
    } else {
      // Fetch all upcoming bookings
      const snapshot = await db.collection('bookings').get();
        
      // Return a map of date -> array of booked times
      const bookingsByDate: Record<string, string[]> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'CANCELLED') return;
        
        if (!bookingsByDate[data.date]) {
          bookingsByDate[data.date] = [];
        }
        bookingsByDate[data.date].push(data.time);
      });
      
      return NextResponse.json({ bookingsByDate }, { status: 200 });
    }
  } catch (error: any) {
    console.error('GET /api/bookings Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


async function verifyReceiptWithAI(receiptUrl: string, expectedAmount: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return false;

  try {
    const imageRes = await fetch(receiptUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `You are a strict payment receipt verifier. Check if this receipt image contains:\n1. The word "Successful" or "Success" or similar indicating a completed transfer.\n2. An amount of exactly ₦${expectedAmount.toLocaleString()} or ${expectedAmount}.\n\nRespond with ONLY a raw JSON object: {"verified": true} or {"verified": false, "reason": "..."}. Do not use markdown.` },
            { inline_data: { mime_type: mimeType, data: base64Image } }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return false;

    const cleaned = text.replace(/\x60\x60\x60json/g, '').replace(/\x60\x60\x60/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed.verified === true;
  } catch (e) {
    console.error("AI Verification Error", e);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, instagram, notes, ref, date, time, items, total, photoUrl, receiptUrl, userId } = body;

    if (!email || !date || !time || !ref) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminDb();
    const bookingsRef = db.collection('bookings');
    
    // Check if slot is already taken
    const existing = await bookingsRef
      .where('date', '==', date)
      .where('time', '==', time)
      .get();

    const isActuallyBooked = existing.docs.some(doc => {
       const status = doc.data().status;
       return status === 'CONFIRMED' || status === 'COMPLETED';
    });

    if (isActuallyBooked) {
      return NextResponse.json({ success: false, error: 'Slot already booked' }, { status: 409 });
    }

    // Determine Expected Deposit
    let depositAmount = 5000;
    try {
      const settingsDoc = await db.collection('storefront_config').doc('main').get();
      if (settingsDoc.exists && settingsDoc.data()?.depositAmount !== undefined) {
        depositAmount = settingsDoc.data().depositAmount;
      }
    } catch(e) {}
    const expectedDeposit = Math.min(total, depositAmount);

    // AI Verification
    let finalStatus = 'PENDING_VERIFICATION';
    if (receiptUrl) {
      const isVerified = await verifyReceiptWithAI(receiptUrl, expectedDeposit);
      if (isVerified) {
        finalStatus = 'CONFIRMED';
      }
    }

    // Save to Firestore
    await bookingsRef.doc(ref).set({
      email: email ? email.toLowerCase().trim() : '',
      firstName,
      lastName,
      phone: phone || '',
      instagram: instagram || '',
      notes: notes || '',
      ref,
      date,
      time,
      items,
      total,
      photoUrl: photoUrl || null,
      receiptUrl: receiptUrl || null,
      userId: userId || null,
      status: finalStatus,
      createdAt: new Date().toISOString()
    });

    const formatMoney = (amount: number) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
    };

    const itemsHtml = items && items.length > 0 
      ? `<table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
          ${items.map((item: any) => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">
                <div style="font-weight: bold;">${item.name} (x${item.quantity || 1})</div>
                <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
                  ${item.selectedLength ? `<div>&bull; Length: ${item.selectedLength.name}</div>` : ''}
                  ${item.selectedDesign ? `<div>&bull; Design: ${item.selectedDesign.name}</div>` : ''}
                  ${item.selectedExtras?.map((e: any) => `<div>&bull; Extra: ${e.name}</div>`).join('') || ''}
                </div>
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; vertical-align: top;">${item.price}</td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">${formatMoney(total)}</td>
          </tr>
         </table>`
      : '<p>No services found in payload.</p>';

    // Generate Calendar ICS
    let durationMinutes = 120;
    try {
      if (items && items.length > 0) {
        let totalMins = 0;
        items.forEach((item: any) => {
           let mins = 0;
           const dStr = item.duration || '';
           if (dStr.includes('h')) mins += parseInt(dStr.split('h')[0]) * 60;
           if (dStr.includes('m')) {
             const mMatch = dStr.match(/(\d+)m/);
             if (mMatch) mins += parseInt(mMatch[1]);
           }
           if (mins === 0) mins = 60;
           totalMins += (mins * (item.quantity || 1));
        });
        if (totalMins > 0) durationMinutes = totalMins;
      }
    } catch(e) {}

    const [hours, minutesStr] = time.split(':');
    const startDate = new Date(date);
    startDate.setUTCHours(parseInt(hours, 10) - 1); 
    startDate.setUTCMinutes(parseInt(minutesStr, 10));
    
    const endDate = new Date(startDate);
    endDate.setUTCMinutes(startDate.getUTCMinutes() + durationMinutes);

    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsString = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//E.star SleekNails//Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `DTSTART:${formatICSDate(startDate)}`,
      `DTEND:${formatICSDate(endDate)}`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `UID:${ref}@estarsleeknails.com`,
      `SUMMARY:Nail Appointment @ E.star SleekNails`,
      `DESCRIPTION:Your appointment for: ${items.map((i:any) => i.name).join(', ')}.`,
      `LOCATION:E.star SleekNails Studio`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'DESCRIPTION:Reminder',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Admin Email
    let adminEmail = 'peteratambaesther@gmail.com';
    try {
      const settingsDoc = await db.collection('storefront_config').doc('main').get();
      if (settingsDoc.exists) {
        adminEmail = (settingsDoc.data()?.adminEmail && settingsDoc.data()?.adminEmail !== 'oseghaleleonard39@gmail.com') ? settingsDoc.data().adminEmail : adminEmail;
      }
    } catch (e) {}

    // Send emails via Nodemailer
    try {
      if (finalStatus === 'CONFIRMED') {
        // AI Verified successfully, send official receipt
        await sendEmail({
          to: [email],
          replyTo: adminEmail,
          subject: `Official Receipt - E.star SleekNails Booking (${ref})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 20px;">
              <div style="text-align: center; border-bottom: 2px solid #1A1414; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #1A1414; margin: 0;">E.star SleekNails</h1>
                <p style="color: #666; margin: 5px 0 0 0;">Official Payment Receipt</p>
              </div>
              <p>Hi ${firstName || 'Valued Client'},</p>
              <p>Your payment has been successfully confirmed. Your appointment is now <strong>fully secured</strong>.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 5px 0;"><strong>Receipt No:</strong></td><td style="padding: 5px 0; text-align: right;">${ref}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Appointment Date:</strong></td><td style="padding: 5px 0; text-align: right;">${new Date(date + "T12:00:00").toLocaleDateString()} at ${time}</td></tr>
                  <tr><td style="padding: 5px 0;"><strong>Status:</strong></td><td style="padding: 5px 0; text-align: right; color: green; font-weight: bold;">CONFIRMED / PAID</td></tr>
                </table>
              </div>
              <h3 style="margin-top: 20px;">Services Booked</h3>
              ${itemsHtml}
              <p style="margin-top: 20px; font-size: 0.9em; color: #666;">We have attached a calendar invite to this email. See you soon!</p>
            </div>
          `,
          attachments: [{ filename: 'invite.ics', content: Buffer.from(icsString).toString('base64'), contentType: 'text/calendar' }]
        });
      } else {
        // Manual Verification Needed
        await sendEmail({
          to: [email],
          replyTo: adminEmail,
          subject: `Booking Request Received: ${ref} (Verification Pending)`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #1A1414;">Hi ${firstName},</h1>
              <p>We have successfully received your appointment request!</p>
              <div style="background-color: #e2f3f5; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #bee5eb;">
                <strong>Status Update:</strong> Your booking is currently <strong>PENDING VERIFICATION</strong>. We have received your payment receipt and our team is reviewing it.
              </div>
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin:0 0 10px 0;"><strong>Reference:</strong> ${ref}</p>
                <p style="margin:0 0 10px 0;"><strong>Date:</strong> ${new Date(date + "T12:00:00").toLocaleDateString()}</p>
                <p style="margin:0 0 10px 0;"><strong>Time:</strong> ${time}</p>
                <h3 style="margin: 20px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Services Booked</h3>
                ${itemsHtml}
              </div>
              <p>Once your payment is manually confirmed by our team, your status will update to CONFIRMED and you will receive an Official Receipt.</p>
              <p>Best regards,<br>E.star SleekNails Team</p>
            </div>
          `
        });
      }

      

      const adminEmailPayload: any = {
        to: [adminEmail],
        subject: `${finalStatus === 'CONFIRMED' ? 'Confirmed Booking' : 'New Booking Alert'}: ${ref}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1A1414;">${finalStatus === 'CONFIRMED' ? 'AI Auto-Verified Appointment' : 'New Appointment Booked'}</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Status:</strong> ${finalStatus === 'CONFIRMED' ? '<span style="color: green; font-weight: bold;">CONFIRMED</span>' : '<span style="color: orange; font-weight: bold;">PENDING VERIFICATION (Requires Manual Review)</span>'}</p>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              ${instagram ? `<p><strong>Instagram:</strong> @${instagram}</p>` : ''}
              <p><strong>Date/Time:</strong> ${new Date(date + "T12:00:00").toLocaleDateString()} @ ${time}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              ${photoUrl ? `<p><strong>Inspiration Photo:</strong></p><img src="${photoUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;" />` : ''}
              ${receiptUrl ? `<p><strong>Payment Receipt:</strong></p><img src="${receiptUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 10px; border: 2px solid #28a745;" />` : ''}
              ${itemsHtml}
            </div>
          </div>
        `
      };

      if (receiptUrl) {
        try {
          const res = await fetch(receiptUrl);
          const buffer = await res.arrayBuffer();
          adminEmailPayload.attachments = [
            {
              filename: 'Payment_Receipt.jpg',
              content: Buffer.from(buffer).toString('base64'),
              contentType: res.headers.get('content-type') || 'image/jpeg'
            }
          ];
        } catch(e) { console.error("Failed to attach receipt file", e); }
      }
      
      await sendEmail(adminEmailPayload);
    } catch (emailError) {
      console.error("Failed to send booking emails:", emailError);
    }

    return NextResponse.json({ success: true, message: 'Booking created' }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/bookings Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }
    
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const data = docSnap.data() as any;
    
    // Security Check: Non-admins can only CANCEL their OWN bookings
    if (!decodedClaims.admin) {
      if (data.userId !== decodedClaims.uid && data.email !== decodedClaims.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Forbidden: You can only cancel bookings' }, { status: 403 });
      }
    }
    
    await docRef.update({ status });
    
    // Send email notification on cancellation
    if (status === 'CANCELLED' && data.email && true) {
      try {
        
        
        // Email to customer
        await sendEmail({
          
          to: [data.email],
          subject: `Booking Cancelled: ${data.ref || id}`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #1A1414;">Hi ${data.firstName || 'there'},</h1>
              <p>Your appointment on <strong>${new Date(data.date + "T12:00:00").toLocaleDateString()}</strong> at <strong>${data.time}</strong> has been successfully cancelled as requested.</p>
              <p>If you have any questions or wish to reschedule, please visit our website.</p>
              <p>Best regards,<br/>E.star SleekNails Team</p>
            </div>
          `
        });
        
        // Alert Admin
        let adminEmail = 'peteratambaesther@gmail.com';
        try {
          const settingsDoc = await db.collection('storefront_config').doc('main').get();
          if (settingsDoc.exists) adminEmail = (settingsDoc.data()?.adminEmail && settingsDoc.data()?.adminEmail !== 'oseghaleleonard39@gmail.com') ? settingsDoc.data().adminEmail : adminEmail;
        } catch(e) {}
        
        await sendEmail({
          
          to: [adminEmail],
          subject: `Booking Cancelled Alert: ${data.ref || id}`,
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #1A1414;">Appointment Cancelled</h2>
              <p>The following appointment was cancelled:</p>
              <ul>
                <li><strong>Ref:</strong> ${data.ref || id}</li>
                <li><strong>Customer:</strong> ${data.firstName} ${data.lastName} (${data.email})</li>
                <li><strong>Date/Time:</strong> ${new Date(data.date + "T12:00:00").toLocaleDateString()} @ ${data.time}</li>
              </ul>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send cancellation emails:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH Booking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (!decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('bookings').doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





