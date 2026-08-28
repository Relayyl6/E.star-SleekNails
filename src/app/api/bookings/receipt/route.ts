import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const db = getAdminDb();
    const docRef = db.collection('bookings').doc(bookingId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    const data = docSnap.data() as any;

    if (!data.email) {
      return NextResponse.json({ error: 'No email found for this booking' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Create the receipt HTML
    const itemsHtml = data.items?.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
      </tr>
    `).join('') || `<tr><td colspan="3" style="padding: 10px;">Custom Service</td></tr>`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [data.email],
      subject: `Your Receipt from E.star SleekNails - ${data.ref || data.id}`,
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333; padding: 20px;">
          <div style="text-align: center; border-bottom: 2px solid #1A1414; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #1A1414; margin: 0;">OFFICIAL RECEIPT</h1>
            <p style="color: #666; margin-top: 5px;">E.star SleekNails</p>
          </div>
          
          <p>Hi <strong>${data.firstName}</strong>,</p>
          <p>Thank you for your business! This email serves as your official receipt for your booking.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0;"><strong>Reference:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${data.ref || data.id}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Appointment Date:</strong></td>
                <td style="padding: 5px 0; text-align: right;">${new Date(data.date).toLocaleDateString()} at ${data.time}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Status:</strong></td>
                <td style="padding: 5px 0; text-align: right; color: green; font-weight: bold;">CONFIRMED / PAID</td>
              </tr>
            </table>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Service</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">Total Paid:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px; border-top: 2px solid #333;">${String(data.total || '0').includes('₦') ? data.total : `₦${data.total || '0'}`}</td>
              </tr>
            </tbody>
          </table>
          
          <p style="text-align: center; color: #888; font-size: 12px; margin-top: 40px;">
            Thank you for choosing E.star SleekNails! We look forward to seeing you.
          </p>
        </div>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/bookings/receipt Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
