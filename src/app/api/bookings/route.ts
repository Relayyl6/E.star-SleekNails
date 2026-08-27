import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const type = searchParams.get('type');
    const db = getAdminDb();
    
    if (type === 'full') {
      const email = searchParams.get('email');
      let snapshot;
      if (email) {
        snapshot = await db.collection('bookings').where('customerEmail', '==', email).get();
      } else {
        snapshot = await db.collection('bookings').get();
      }
      
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json(bookings, { status: 200 });
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, instagram, notes, ref, date, time, items, total, photoUrl } = body;

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

    const isActuallyBooked = existing.docs.some(doc => doc.data().status !== 'CANCELLED');

    if (isActuallyBooked) {
      return NextResponse.json({ success: false, error: 'Slot already booked' }, { status: 409 });
    }

    // Save to Firestore
    await bookingsRef.doc(ref).set({
      email,
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
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    const formatMoney = (amount: number) => {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount).replace('NGN', '₦');
    };

    const itemsHtml = items && items.length > 0 
      ? `<table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
          ${items.map((item: any) => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${item.name} (x${item.quantity || 1})</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">${item.price}</td>
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
           if (dStr.includes('h')) {
             mins += parseInt(dStr.split('h')[0]) * 60;
           }
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
    startDate.setHours(parseInt(hours, 10));
    startDate.setMinutes(parseInt(minutesStr, 10));
    
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + durationMinutes);

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

    // Send emails via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: `Booking Confirmed: ${ref}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #1A1414;">Hi ${firstName},</h1>
            <p>Your appointment has been successfully booked!</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin:0 0 10px 0;"><strong>Reference:</strong> ${ref}</p>
              <p style="margin:0 0 10px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p style="margin:0 0 10px 0;"><strong>Time:</strong> ${time}</p>
              <h3 style="margin: 20px 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Services Booked</h3>
              ${itemsHtml}
            </div>
            <p>We've attached a calendar invite to this email so you don't forget!</p>
            <p>We look forward to seeing you.</p>
          </div>
        `,
        attachments: [
          {
            filename: 'invite.ics',
            content: Buffer.from(icsString).toString('base64'),
            contentType: 'text/calendar'
          }
        ]
      });

      const adminEmailPayload: any = {
        from: 'onboarding@resend.dev',
        to: ['oseghaleleonard39@gmail.com'],
        subject: `New Booking Alert: ${ref}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1A1414;">New Appointment Booked</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              ${instagram ? `<p><strong>Instagram:</strong> @${instagram}</p>` : ''}
              <p><strong>Date/Time:</strong> ${new Date(date).toLocaleDateString()} @ ${time}</p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              ${photoUrl ? `<p><strong>Inspiration Photo:</strong></p><img src="${photoUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 10px;" />` : ''}
              ${itemsHtml}
            </div>
          </div>
        `
      };

      await resend.emails.send(adminEmailPayload);
    }

    return NextResponse.json({ success: true, message: 'Booking created' }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/bookings Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }
    
    await db.collection('bookings').doc(id).update({ status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
