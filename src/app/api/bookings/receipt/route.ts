import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Resend } from 'resend';

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
      if (!decodedClaims.admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

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

    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [data.email],
        subject: `Official Receipt - E.star SleekNails Booking (${data.ref || data.id})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 20px;">
            <div style="text-align: center; border-bottom: 2px solid #1A1414; padding-bottom: 20px; margin-bottom: 20px;">
              <h1 style="color: #1A1414; margin: 0;">E.star SleekNails</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Official Payment Receipt</p>
            </div>
            
            <p>Hi ${data.firstName || 'Valued Client'},</p>
            <p>Your payment has been successfully confirmed. Your appointment is now <strong>fully secured</strong>.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0;"><strong>Receipt No:</strong></td>
                  <td style="padding: 5px 0; text-align: right;">${data.ref || data.id}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Appointment Date:</strong></td>
                  <td style="padding: 5px 0; text-align: right;">${data.date} at ${data.time}</td>
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
    } catch (emailError) {
      console.error("Failed to send receipt email:", emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/bookings/receipt Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
