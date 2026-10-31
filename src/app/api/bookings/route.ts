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
      
      let decodedClaims: any;
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
        for (const snap of snaps.slice(1)) {
          for (const doc of snap.docs) {
            const data = doc.data();
            bookingMap.set(doc.id, { id: doc.id, ...data });
            
            // Auto-link guest bookings to the current user's ID permanently
            if (!data.userId && userId) {
              try {
                db.collection('bookings').doc(doc.id).update({ userId });
              } catch (e) {}
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

// Helper: Format Items HTML table for emails
function buildItemsHtml(items: any[] = [], formattedTotal: string = '₦0') {
  if (!items || items.length === 0) {
    return '<p>No service items listed.</p>';
  }
  return `<table style="width: 100%; margin-top: 10px; border-collapse: collapse; font-family: sans-serif;">
    ${items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7;">
          <div style="font-weight: bold; color: #1a202c;">${item.name} (x${item.quantity || 1})</div>
          <div style="font-size: 0.85em; color: #718096; margin-top: 4px;">
            ${item.selectedLength ? `<div>&bull; Length: ${item.selectedLength.name}</div>` : ''}
            ${item.selectedDesign ? `<div>&bull; Design: ${item.selectedDesign.name}</div>` : ''}
            ${item.selectedExtras?.map((e: any) => `<div>&bull; Extra: ${e.name} (+₦${Number(e.price).toLocaleString()})</div>`).join('') || ''}
          </div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #edf2f7; text-align: right; vertical-align: top; font-weight: 600; color: #2d3748;">${item.price}</td>
      </tr>
    `).join('')}
    <tr>
      <td style="padding: 14px 0; font-weight: bold; font-size: 15px; color: #1a202c;">Total Estimated</td>
      <td style="padding: 14px 0; font-weight: bold; text-align: right; font-size: 16px; color: #1a202c;">${formattedTotal}</td>
    </tr>
  </table>`;
}

// Helper: Generate Calendar ICS invite
function buildCalendarInviteIcs(ref: string, date: string, time: string, items: any[] = []) {
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

  let hours = 12;
  let minutes = 0;
  if (time) {
    const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = match[2] ? parseInt(match[2], 10) : 0;
      const ampm = match[3] ? match[3].toUpperCase() : 'AM';
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  const [y, m, d] = (date || '2026-10-31').split('-').map(Number);
  const startDate = new Date(Date.UTC(y, m - 1, d, hours - 1, minutes)); // WAT is UTC+1
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  const formatICSDate = (dt: Date) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
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
    `DESCRIPTION:Your appointment for: ${(items || []).map((i:any) => i.name).join(', ') || 'Nail Service'}.`,
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
}

// Helper: AI Receipt Verification
interface AIVerificationResult {
  verified: boolean;
  status: 'VERIFIED' | 'FAILED' | 'SKIPPED' | 'ERROR';
  reason: string;
  detectedAmount?: number | null;
  detectedBank?: string | null;
  detectedRecipient?: string | null;
  transactionRef?: string | null;
  timestamp: string;
}

async function verifyReceiptWithAI(receiptUrl: string, expectedAmount: number): Promise<AIVerificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      verified: false,
      status: 'SKIPPED',
      reason: 'Gemini API Key is not configured on the server.',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const imageRes = await fetch(receiptUrl);
    if (!imageRes.ok) {
      return {
        verified: false,
        status: 'FAILED',
        reason: 'Could not fetch uploaded receipt image from storage.',
        timestamp: new Date().toISOString()
      };
    }
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';

    const promptText = `You are a financial receipt verification AI for E.star SleekNails, an upscale nail studio in Abuja, Nigeria.
Analyze this payment receipt image carefully. The client was instructed to transfer a required deposit of exactly ₦${expectedAmount.toLocaleString()} NGN (or ₦${expectedAmount}).

Verify:
1. Transaction Status: Does the receipt confirm a completed transfer? Look for words like "Successful", "Success", "Transaction Completed", "Paid", or checkmark icons.
2. Amount: Is the transferred amount equal to or greater than ${expectedAmount}? Check for exact deposit amount.
3. Recipient: Is the recipient/beneficiary named E.star, Esther, Sleeknails, or account 7049022919 / Moniepoint?

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "verified": true or false,
  "status": "VERIFIED" or "FAILED",
  "reason": "Brief human explanation of your assessment",
  "detectedAmount": <number or null>,
  "detectedBank": "<bank name or null>",
  "detectedRecipient": "<recipient name or null>",
  "transactionRef": "<session id or transaction ref or null>"
}`;

    // Try primary model gemini-3-flash-preview, fall back to gemini-3.1-flash-lite-preview
    const modelsToTry = ['gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview'];
    let lastError = '';

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: promptText },
                { inline_data: { mime_type: mimeType, data: base64Image } }
              ]
            }]
          })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          lastError = data.error?.message || 'Empty response from model';
          continue;
        }

        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          verified: parsed.verified === true,
          status: parsed.verified === true ? 'VERIFIED' : 'FAILED',
          reason: parsed.reason || (parsed.verified ? 'Deposit verified by AI.' : 'Receipt details could not be validated.'),
          detectedAmount: parsed.detectedAmount !== undefined ? parsed.detectedAmount : null,
          detectedBank: parsed.detectedBank || null,
          detectedRecipient: parsed.detectedRecipient || null,
          transactionRef: parsed.transactionRef || null,
          timestamp: new Date().toISOString()
        };
      } catch (err: any) {
        lastError = err.message || 'Model call failed';
      }
    }

    return {
      verified: false,
      status: 'ERROR',
      reason: `AI review temporarily unavailable (${lastError}). Prompted for manual review.`,
      timestamp: new Date().toISOString()
    };
  } catch (e: any) {
    console.error('AI Verification Error:', e);
    return {
      verified: false,
      status: 'ERROR',
      reason: `AI inspection error: ${e.message || 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper: Send Confirmation & Receipt Emails to Customer and Business Owner
async function sendConfirmationEmails({
  email,
  firstName,
  lastName,
  phone,
  instagram,
  ref,
  date,
  time,
  items,
  total,
  adminEmail,
  isAutoVerified = false,
  verifiedReason = ''
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  instagram?: string;
  ref: string;
  date: string;
  time: string;
  items: any[];
  total: string;
  adminEmail: string;
  isAutoVerified?: boolean;
  verifiedReason?: string;
}) {
  const itemsHtml = buildItemsHtml(items, total);
  const icsString = buildCalendarInviteIcs(ref, date, time, items);
  
  let customerEmailSuccess = false;
  let customerEmailError = '';

  // 1. Send confirmation & official receipt to customer
  try {
    const info = await sendEmail({
      to: [email],
      replyTo: adminEmail,
      subject: `Official Receipt & Confirmation - E.star SleekNails (${ref})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 25px; border-radius: 12px;">
          <div style="text-align: center; border-bottom: 2px solid #1A1414; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #1A1414; margin: 0; font-size: 26px;">E.star SleekNails</h1>
            <p style="color: #666; margin: 6px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Official Payment Receipt & Confirmation</p>
          </div>
          <p style="font-size: 16px;">Hi <strong>${firstName || 'Valued Client'}</strong>,</p>
          <p style="color: #444; line-height: 1.6;">Your deposit payment has been confirmed! Your nail appointment is now <strong>fully secured</strong>.</p>
          
          <div style="background-color: #f7fafc; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #edf2f7;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #718096;"><strong>Receipt No:</strong></td><td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold;">${ref}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096;"><strong>Appointment Date:</strong></td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${new Date(date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${time}</td></tr>
              <tr><td style="padding: 6px 0; color: #718096;"><strong>Payment Status:</strong></td><td style="padding: 6px 0; text-align: right; color: #2e7d32; font-weight: bold;">CONFIRMED / DEPOSIT PAID</td></tr>
            </table>
          </div>

          <h3 style="margin-top: 25px; margin-bottom: 10px; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 6px;">Services Booked</h3>
          ${itemsHtml}

          <div style="margin-top: 25px; padding: 15px; background-color: #f0fff4; border-left: 4px solid #38a169; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #22543d; line-height: 1.5;">
              🗓️ <strong>Calendar Invite Attached:</strong> We have attached an invite (invite.ics) to this email so you can add this appointment directly to your Google, Apple, or Outlook Calendar.
            </p>
          </div>

          <div style="margin-top: 25px; font-size: 13px; color: #718096; line-height: 1.5;">
            <p><strong>Studio Address:</strong> Abuja, Gwarimpa, Azah Scents in front of Drugmart and Greens 2nd Avenue gwarimpa</p>
            <p>Need to update your nail inspiration photo or design notes? You can manage your appointment anytime from your <a href="https://e-star-sleek-nails.vercel.app/dashboard" style="color: #1A1414; font-weight: bold;">Customer Dashboard</a>.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eee; pt-4; color: #a0aec0; font-size: 12px;">
            <p style="margin: 10px 0 0 0;">Thank you for choosing E.star SleekNails.</p>
          </div>
        </div>
      `,
      attachments: [{ filename: 'invite.ics', content: Buffer.from(icsString).toString('base64'), contentType: 'text/calendar' }]
    });
    customerEmailSuccess = true;
    console.log('[CONFIRM] Customer confirmation email sent:', 'messageId' in (info ?? {}) ? (info as any).messageId : 'sent');
  } catch (err: any) {
    customerEmailSuccess = false;
    customerEmailError = err.message || 'Error sending customer email';
    console.error('[CONFIRM] Customer email error:', err);
  }

  // 2. Send confirmation notice to business owner
  let adminEmailSuccess = false;
  try {
    const adminInfo = await sendEmail({
      to: [adminEmail],
      subject: `Confirmed Appointment: ${ref} - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1A1414; margin-top: 0;">Appointment Confirmed</h2>
          <div style="background-color: #ebf8ff; color: #2b6cb0; padding: 12px; border-radius: 8px; margin: 15px 0; font-size: 14px;">
            <strong>Confirmation Notice:</strong> This appointment has been marked as <strong>CONFIRMED</strong> ${isAutoVerified ? '(AI Auto-Verified)' : '(Approved by Owner)'}.
            ${verifiedReason ? `<br/><span style="font-size: 12px; color: #4a5568;">Reason: ${verifiedReason}</span>` : ''}
          </div>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0 0 6px 0;"><strong>Reference:</strong> ${ref}</p>
            <p style="margin: 0 0 6px 0;"><strong>Customer:</strong> ${firstName} ${lastName}</p>
            <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
            ${instagram ? `<p style="margin: 0 0 6px 0;"><strong>Instagram:</strong> @${instagram}</p>` : ''}
            <p style="margin: 0 0 6px 0;"><strong>Date & Time:</strong> ${new Date(date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at ${time}</p>
            <p style="margin: 0;"><strong>Customer Receipt Email:</strong> ${customerEmailSuccess ? 'Sent successfully ✅' : `Failed: ${customerEmailError}`}</p>
          </div>
          ${itemsHtml}
        </div>
      `
    });
    adminEmailSuccess = true;
    console.log('[CONFIRM] Admin confirmation email sent:', 'messageId' in (adminInfo ?? {}) ? (adminInfo as any).messageId : 'sent');
  } catch (err: any) {
    console.error('[CONFIRM] Admin email error:', err);
  }

  return { customerEmailSuccess, customerEmailError, adminEmailSuccess };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      instagram, 
      notes, 
      ref, 
      date, 
      time, 
      items, 
      total, 
      photoUrl, 
      inspirationLink,
      receiptUrl, 
      userId 
    } = body;

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
       return status === 'CONFIRMED' || status === 'COMPLETED' || status === 'BLOCKED' || status === 'PENDING' || status === 'PENDING_VERIFICATION';
    });

    if (isActuallyBooked) {
      return NextResponse.json({ success: false, error: 'Slot already booked' }, { status: 409 });
    }

    // Determine Expected Deposit & AI Review Setting
    let depositAmount = 5000;
    let aiReviewEnabled = true;
    let adminEmail = 'peteratambaesther@gmail.com';

    try {
      const settingsDoc = await db.collection('storefront_config').doc('main').get();
      if (settingsDoc.exists) {
        const sData = settingsDoc.data();
        if (sData?.depositAmount !== undefined) depositAmount = sData.depositAmount;
        if (sData?.aiReceiptReviewEnabled !== undefined) aiReviewEnabled = sData.aiReceiptReviewEnabled;
        if (sData?.adminEmail && sData.adminEmail !== 'oseghaleleonard39@gmail.com') adminEmail = sData.adminEmail;
      }
    } catch(e) {}

    const totalNum = typeof total === 'number' 
      ? total 
      : parseInt(String(total || '0').replace(/[^\d]/g, ''), 10) || 0;
    const expectedDeposit = Math.min(totalNum, depositAmount);

    // AI Verification
    let finalStatus = 'PENDING_VERIFICATION';
    let aiResult: AIVerificationResult = {
      verified: false,
      status: 'SKIPPED',
      reason: receiptUrl ? 'Receipt uploaded, awaiting verification.' : 'No receipt uploaded.',
      timestamp: new Date().toISOString()
    };

    if (receiptUrl) {
      if (aiReviewEnabled) {
        aiResult = await verifyReceiptWithAI(receiptUrl, expectedDeposit);
        if (aiResult.verified) {
          finalStatus = 'CONFIRMED';
        }
      } else {
        aiResult = {
          verified: false,
          status: 'SKIPPED',
          reason: 'AI auto-review disabled in studio settings. Manual review required.',
          timestamp: new Date().toISOString()
        };
      }
    }

    const formatMoney = (amount: number) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
    };

    const hasPlus = items && items.some((item: any) => 
      item.price?.includes('+') || 
      (item.selectedExtras && item.selectedExtras.length > 0) || 
      item.name?.toLowerCase().includes('freestyle') || 
      item.name?.toLowerCase().includes('custom') ||
      item.selectedDesign?.hasPlus
    );

    const formattedTotal = `${formatMoney(totalNum)}${hasPlus ? '+' : ''}`;

    const nowIso = new Date().toISOString();

    // Initial booking payload
    const bookingPayload = {
      email: email ? email.toLowerCase().trim() : '',
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      instagram: instagram || '',
      notes: notes || '',
      ref,
      date,
      time,
      items: items || [],
      total: formattedTotal,
      photoUrl: photoUrl || inspirationLink || null,
      inspirationLink: inspirationLink || null,
      receiptUrl: receiptUrl || null,
      userId: userId || null,
      status: finalStatus,
      aiVerification: aiResult,
      receiptEmailSent: false,
      receiptEmailStatus: 'PENDING',
      createdAt: nowIso,
      updatedAt: nowIso,
      editHistory: [
        {
          timestamp: nowIso,
          action: 'CREATED',
          editedBy: email,
          role: 'CLIENT',
          changes: { initialStatus: finalStatus }
        }
      ]
    };

    // Save to Firestore
    await bookingsRef.doc(ref).set(bookingPayload);

    // Send Emails
    try {
      if (finalStatus === 'CONFIRMED') {
        const emailResults = await sendConfirmationEmails({
          email,
          firstName,
          lastName,
          phone,
          instagram,
          ref,
          date,
          time,
          items,
          total: formattedTotal,
          adminEmail,
          isAutoVerified: true,
          verifiedReason: aiResult.reason
        });

        await bookingsRef.doc(ref).update({
          receiptEmailSent: emailResults.customerEmailSuccess,
          receiptEmailStatus: emailResults.customerEmailSuccess ? 'SENT' : `FAILED: ${emailResults.customerEmailError}`,
          receiptEmailSentAt: emailResults.customerEmailSuccess ? new Date().toISOString() : null
        });
      } else {
        // Customer Pending Verification Email
        await sendEmail({
          to: [email],
          replyTo: adminEmail,
          subject: `Booking Request Received: ${ref} (Verification Pending)`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h1 style="color: #1A1414; font-size: 24px;">Hi ${firstName || 'there'},</h1>
              <p>We have successfully received your nail appointment request!</p>
              <div style="background-color: #e2f3f5; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #bee5eb;">
                <strong>Status Update:</strong> Your booking is currently <strong>PENDING VERIFICATION</strong>. We have received your payment receipt and our team is reviewing it.
              </div>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin:0 0 8px 0;"><strong>Reference:</strong> ${ref}</p>
                <p style="margin:0 0 8px 0;"><strong>Date:</strong> ${new Date(date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p style="margin:0 0 8px 0;"><strong>Time:</strong> ${time}</p>
                <h3 style="margin: 15px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Services Booked</h3>
                ${buildItemsHtml(items, formattedTotal)}
              </div>
              <p style="font-size: 13px; color: #666;">Once your deposit payment is confirmed by our studio, your status will update to CONFIRMED and you will receive an Official Receipt with your calendar invite.</p>
              <p>Best regards,<br>E.star SleekNails Team</p>
            </div>
          `
        });

        // Admin Alert with AI Receipt Verification Report
        const adminEmailPayload: any = {
          to: [adminEmail],
          subject: `New Booking Alert: ${ref} (${finalStatus})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #1A1414; margin-top: 0;">New Appointment Booked</h2>
              
              <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 14px; border-radius: 6px; margin: 15px 0; font-size: 13px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; color: #c05621; font-size: 14px;">🤖 AI Receipt Review Status: ${aiResult.status}</p>
                <p style="margin: 0 0 4px 0;"><strong>Assessment:</strong> ${aiResult.reason}</p>
                ${aiResult.detectedAmount ? `<p style="margin: 0 0 4px 0;"><strong>Detected Amount:</strong> ₦${Number(aiResult.detectedAmount).toLocaleString()}</p>` : ''}
                ${aiResult.detectedBank ? `<p style="margin: 0 0 4px 0;"><strong>Bank:</strong> ${aiResult.detectedBank}</p>` : ''}
                <p style="margin: 0; color: #718096; font-size: 11px;">Expected Deposit: ₦${expectedDeposit.toLocaleString()} &bull; Reviewed at ${aiResult.timestamp}</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 6px 0;"><strong>Status:</strong> <span style="color: orange; font-weight: bold;">PENDING VERIFICATION</span></p>
                <p style="margin: 0 0 6px 0;"><strong>Client Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0 0 6px 0;"><strong>Phone:</strong> ${phone || 'N/A'}</p>
                ${instagram ? `<p style="margin: 0 0 6px 0;"><strong>Instagram:</strong> @${instagram}</p>` : ''}
                <p style="margin: 0 0 6px 0;"><strong>Date & Time:</strong> ${new Date(date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} @ ${time}</p>
                ${notes ? `<p style="margin: 0 0 6px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
                ${photoUrl || inspirationLink ? `<p style="margin: 0 0 6px 0;"><strong>Inspiration:</strong> <a href="${photoUrl || inspirationLink}" target="_blank">View Inspiration</a></p>` : ''}
              </div>

              ${buildItemsHtml(items, formattedTotal)}

              ${receiptUrl ? `<div style="margin-top: 15px;"><p style="font-weight: bold;">Attached Payment Receipt:</p><img src="${receiptUrl}" style="max-width: 100%; border-radius: 8px; border: 1px solid #ddd;" /></div>` : ''}
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
      }
    } catch (emailError) {
      console.error("Failed to send booking emails:", emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking created',
      status: finalStatus,
      aiVerification: aiResult 
    }, { status: 200 });
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
    
    let decodedClaims: any;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const db = getAdminDb();
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }
    
    const docRef = db.collection('bookings').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const currentData = docSnap.data() as any;
    const isAdmin = !!decodedClaims.admin;
    const isOwner = (currentData.userId && currentData.userId === decodedClaims.uid) ||
                    (currentData.email && currentData.email.toLowerCase().trim() === (decodedClaims.email || '').toLowerCase().trim());

    // Security Check: Non-admins can only modify their OWN bookings
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden: You can only view and modify your own bookings' }, { status: 403 });
    }

    const nowIso = new Date().toISOString();
    const isDepositPaid = currentData.status === 'CONFIRMED' || currentData.status === 'COMPLETED';

    // Client-Specific Restrictions Enforced in Backend:
    if (!isAdmin) {
      if (currentData.status === 'CANCELLED') {
        return NextResponse.json({ error: 'Cannot modify a cancelled appointment.' }, { status: 400 });
      }

      // Clients cannot alter service pricing or items directly
      if (body.items !== undefined || body.total !== undefined) {
        return NextResponse.json({ 
          error: 'Service packages and pricing are locked once booked. Please message or call the studio for adjustments.' 
        }, { status: 403 });
      }

      // Clients cannot change status (except requesting cancellation)
      if (body.status !== undefined && body.status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Forbidden: Only the studio owner can approve or modify appointment status.' }, { status: 403 });
      }

      // Reschedule checks if client changed date or time
      if (body.date !== undefined || body.time !== undefined) {
        const targetDate = body.date || currentData.date;
        const targetTime = body.time || currentData.time;

        if (targetDate !== currentData.date || targetTime !== currentData.time) {
          // Cannot reschedule to the past
          const pad = (n: number) => n.toString().padStart(2, '0');
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
          if (targetDate < todayStr) {
            return NextResponse.json({ error: 'Cannot reschedule to a past date.' }, { status: 400 });
          }

          // If deposit has been confirmed, enforce 24-hour studio reschedule policy
          if (isDepositPaid) {
            const currentBookingDateTime = new Date(`${currentData.date}T${currentData.time?.split(' ')[0] || '12:00'}:00`);
            const hoursNotice = (currentBookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
            if (hoursNotice < 24) {
              return NextResponse.json({ 
                error: 'Studio Policy: Appointments cannot be rescheduled online within 24 hours of the scheduled time. Please call the studio directly.' 
              }, { status: 400 });
            }
          }

          // Strict Slot Conflict Detection: Ensure target slot is not occupied
          const conflictSnap = await db.collection('bookings')
            .where('date', '==', targetDate)
            .where('time', '==', targetTime)
            .get();

          const conflicting = conflictSnap.docs.find(d => d.id !== id && d.data().status !== 'CANCELLED');
          if (conflicting) {
            return NextResponse.json({ 
              error: `Slot ${targetTime} on ${targetDate} is already booked. Please choose an open slot.` 
            }, { status: 409 });
          }
        }
      }
    }

    // Build update payload and log changes
    const updatePayload: any = {
      updatedAt: nowIso
    };

    const changes: Record<string, { from: any, to: any }> = {};

    // Track allowed editable fields
    const editableFields = ['photoUrl', 'inspirationLink', 'notes', 'phone', 'instagram', 'firstName', 'lastName', 'date', 'time'];
    editableFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== currentData[field]) {
        changes[field] = { from: currentData[field] ?? null, to: body[field] };
        updatePayload[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    });

    // Special handling for photoUrl / inspirationLink synchronization
    if (body.inspirationLink !== undefined) {
      updatePayload.inspirationLink = body.inspirationLink.trim();
      if (!body.photoUrl && !currentData.photoUrl) {
        updatePayload.photoUrl = body.inspirationLink.trim();
      }
    }

    // Handle Status Change (Admin approval or Cancellation)
    const targetStatus = body.status;
    let confirmationTriggered = false;

    if (targetStatus && targetStatus !== currentData.status) {
      changes['status'] = { from: currentData.status, to: targetStatus };
      updatePayload.status = targetStatus;

      // When Owner clicks Confirm / Approves payment:
      if (targetStatus === 'CONFIRMED' && isAdmin) {
        confirmationTriggered = true;
        updatePayload.confirmedAt = nowIso;
        updatePayload.confirmedBy = decodedClaims.email || 'Admin';
      }
    }

    // Append to Audit Edit History
    const editHistory = Array.isArray(currentData.editHistory) ? [...currentData.editHistory] : [];
    if (Object.keys(changes).length > 0) {
      editHistory.push({
        timestamp: nowIso,
        editedBy: decodedClaims.email || (isAdmin ? 'Admin' : 'Client'),
        role: isAdmin ? 'ADMIN' : 'CLIENT',
        changes
      });
      updatePayload.editHistory = editHistory;
    }

    // Save updates
    await docRef.update(updatePayload);

    // Fetch studio admin email
    let adminEmail = 'peteratambaesther@gmail.com';
    try {
      const settingsDoc = await db.collection('storefront_config').doc('main').get();
      if (settingsDoc.exists) {
        const sData = settingsDoc.data();
        if (sData?.adminEmail && sData.adminEmail !== 'oseghaleleonard39@gmail.com') {
          adminEmail = sData.adminEmail;
        }
      }
    } catch(e) {}

    // Send Confirmation Emails on Owner Confirm
    if (confirmationTriggered) {
      const emailResults = await sendConfirmationEmails({
        email: currentData.email,
        firstName: updatePayload.firstName || currentData.firstName,
        lastName: updatePayload.lastName || currentData.lastName,
        phone: updatePayload.phone || currentData.phone,
        instagram: updatePayload.instagram || currentData.instagram,
        ref: currentData.ref || id,
        date: updatePayload.date || currentData.date,
        time: updatePayload.time || currentData.time,
        items: currentData.items || [],
        total: currentData.total || '₦0',
        adminEmail,
        isAutoVerified: false,
        verifiedReason: 'Confirmed and approved by studio owner.'
      });

      await docRef.update({
        receiptEmailSent: emailResults.customerEmailSuccess,
        receiptEmailStatus: emailResults.customerEmailSuccess ? 'SENT' : `FAILED: ${emailResults.customerEmailError}`,
        receiptEmailSentAt: emailResults.customerEmailSuccess ? nowIso : null
      });
    }

    // Send Reschedule Email (admin changed date or time)
    const dateChanged = changes['date'] !== undefined;
    const timeChanged = changes['time'] !== undefined;
    if (isAdmin && (dateChanged || timeChanged) && currentData.email) {
      const newDate = updatePayload.date || currentData.date;
      const newTime = updatePayload.time || currentData.time;
      const oldDate = currentData.date;
      const oldTime = currentData.time;
      const formattedOld = `${new Date(oldDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${oldTime}`;
      const formattedNew = `${new Date(newDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${newTime}`;
      try {
        await sendEmail({
          to: [currentData.email],
          subject: `Your Appointment Has Been Rescheduled — ${currentData.ref || id}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <h1 style="color: #1A1414; font-size: 22px; margin-top: 0;">Appointment Rescheduled</h1>
              <p>Hi <strong>${currentData.firstName || 'there'}</strong>,</p>
              <p>Your appointment at <strong>E.star SleekNails</strong> has been rescheduled by the studio.</p>

              <div style="background-color: #f7fafc; border-left: 4px solid #1A1414; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em;">Previous Time</p>
                <p style="margin: 0; font-size: 15px; text-decoration: line-through; color: #999;">${formattedOld}</p>
              </div>

              <div style="background-color: #ebf8ff; border-left: 4px solid #2b6cb0; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #2b6cb0; text-transform: uppercase; letter-spacing: 0.05em;">New Time</p>
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1A1414;">${formattedNew}</p>
              </div>

              <p style="font-size: 14px; color: #4a5568;">Your booking reference is <strong>${currentData.ref || id}</strong>. All other details remain the same.</p>
              <p style="font-size: 14px; color: #4a5568;">If this time does not work for you, please contact us as soon as possible so we can find an alternative.</p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #a0aec0; text-align: center;">
                <p style="margin: 0;">E.star SleekNails &bull; Abuja, Gwarimpa</p>
              </div>
            </div>
          `
        });
        console.log('[RESCHEDULE] Reschedule notification sent to', currentData.email);
      } catch (rescheduleEmailErr) {
        console.error('[RESCHEDULE] Failed to send reschedule email:', rescheduleEmailErr);
      }
    }

    // Send Cancellation Emails
    if (targetStatus === 'CANCELLED' && currentData.email) {
      try {
        await sendEmail({
          to: [currentData.email],
          subject: `Booking Cancelled: ${currentData.ref || id}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h1 style="color: #1A1414;">Hi ${currentData.firstName || 'there'},</h1>
              <p>Your appointment on <strong>${new Date(currentData.date + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong> at <strong>${currentData.time}</strong> has been cancelled.</p>
              <p>If you have any questions or wish to book a new appointment, please visit our website.</p>
              <p>Best regards,<br/>E.star SleekNails Team</p>
            </div>
          `
        });

        await sendEmail({
          to: [adminEmail],
          subject: `Booking Cancelled Alert: ${currentData.ref || id}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #1A1414;">Appointment Cancelled</h2>
              <p>The following appointment was cancelled by ${isAdmin ? 'Studio Owner' : 'Client'}:</p>
              <ul>
                <li><strong>Ref:</strong> ${currentData.ref || id}</li>
                <li><strong>Customer:</strong> ${currentData.firstName} ${currentData.lastName} (${currentData.email})</li>
                <li><strong>Date/Time:</strong> ${new Date(currentData.date + "T12:00:00").toLocaleDateString()} @ ${currentData.time}</li>
              </ul>
            </div>
          `
        });
      } catch (emailError) {
        console.error("Failed to send cancellation emails:", emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking updated successfully',
      updated: { ...currentData, ...updatePayload }
    }, { status: 200 });
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
    
    let decodedClaims: any;
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
