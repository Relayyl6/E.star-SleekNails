import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, ref, date, time } = body;

    if (!email || !firstName || !ref) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminDb();

    // Check if the booking somehow actually went through
    const existing = await db.collection('bookings').doc(ref).get();
    if (existing.exists) {
       // It's not actually abandoned if it's already in the DB as PENDING_VERIFICATION or CONFIRMED
       return NextResponse.json({ success: true, message: 'Already booked' }, { status: 200 });
    }

    // Save as ABANDONED
    await db.collection('bookings').doc(ref).set({
      email: email.toLowerCase().trim(),
      firstName,
      lastName: lastName || '',
      phone: phone || '',
      ref,
      date: date || 'Unknown',
      time: time || 'Unknown',
      status: 'ABANDONED',
      createdAt: new Date().toISOString()
    });

    let adminEmail = 'peteratambaesther@gmail.com';
    try {
      const settingsDoc = await db.collection('storefront_config').doc('main').get();
      if (settingsDoc.exists) {
        adminEmail = (settingsDoc.data()?.adminEmail && settingsDoc.data()?.adminEmail !== 'oseghaleleonard39@gmail.com') ? settingsDoc.data().adminEmail : adminEmail;
      }
    } catch (e) {}

    // Fallback Email to Customer
    await sendEmail({
      to: [email],
      replyTo: adminEmail,
      subject: `Action Required: Incomplete Booking (${ref})`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #1A1414;">Hi ${firstName},</h1>
          <p>We noticed you started booking an appointment for <strong>${date ? new Date(date + "T12:00:00").toLocaleDateString() : 'a date'}</strong> at <strong>${time}</strong> but didn't finish uploading your payment receipt before the time limit expired.</p>
          <div style="background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5c6cb;">
            <strong>Your time slot has been released back to the public.</strong>
          </div>
          <p><strong>If you already transferred the deposit:</strong> Please don't worry! Simply reply directly to this email with your receipt image, or message us on WhatsApp with your Reference Number: <strong>${ref}</strong>.</p>
          <p>If you haven't paid yet, you can always visit our website to start a new booking.</p>
          <p>Best regards,<br>E.star SleekNails Team</p>
        </div>
      `
    });

    // Quiet log for Admin

    await sendEmail({
      to: [adminEmail],
      subject: `Abandoned Booking Log: ${ref}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #1A1414;">Booking Abandoned (Timer Expired)</h2>
          <p>A customer got to the payment screen but did not upload a receipt.</p>
          <ul>
            <li><strong>Name:</strong> ${firstName} ${lastName || ''}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Date/Time:</strong> ${date} @ ${time}</li>
            <li><strong>Ref:</strong> ${ref}</li>
          </ul>
          <p>The customer received an automated email telling them to reply to us if they actually made the transfer.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Abandoned Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
