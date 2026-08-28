import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, date } = body;

    if (!email || !date) {
      return NextResponse.json(
        { error: 'Email and date are required' },
        { status: 400 }
      );
    }

    // Save to Firebase using the Admin SDK
    const adminDb = getAdminDb();
    await adminDb.collection('waitlist').add({
      email,
      date,
      createdAt: new Date().toISOString()
    });

    console.log(`[Waitlist DB Insert]: Added ${email} to waitlist for ${date}`);

    // Send email to vendor
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['oseghaleleonard39@gmail.com'],
        subject: `New Waitlist Entry for ${new Date(date).toLocaleDateString()}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1A1414;">New Waitlist Request</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Requested Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Time of Request:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p>If a slot opens up, you can contact them directly.</p>
          </div>
        `
      });
    }

    return NextResponse.json(
      { message: 'Successfully added to waitlist' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    const adminDb = getAdminDb();
    let snapshot;
    
    if (email) {
      snapshot = await adminDb.collection('waitlist').where('email', '==', email).get();
    } else {
      snapshot = await adminDb.collection('waitlist').get();
    }
      
    const waitlists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      status: 'WAITLIST'
    }));
    
    return NextResponse.json(waitlists, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
