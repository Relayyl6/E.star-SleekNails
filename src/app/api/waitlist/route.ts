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

    const lowerEmail = email.toLowerCase().trim();

    // Save to Firebase using the Admin SDK
    const adminDb = getAdminDb();
    await adminDb.collection('waitlist').add({
      email: lowerEmail,
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
        subject: `New Waitlist Entry for ${date}`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1A1414;">New Waitlist Request</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${lowerEmail}</p>
              <p><strong>Requested Date:</strong> ${date}</p>
              <p><strong>Time of Request:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' })}</p>
            </div>
            <p>If a slot opens up, you can contact them directly.</p>
          </div>
        `
      });
      
      // Send email to client
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [lowerEmail],
        subject: `Waitlist Request Received - E.star SleekNails`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #1A1414;">You're on the Waitlist!</h1>
            <p>Hi there,</p>
            <p>We've successfully added you to the waitlist for <strong>${date}</strong>.</p>
            <p>If a slot opens up on that day, we will contact you immediately at this email address to see if you're still interested in booking.</p>
            <p>Thank you for choosing E.star SleekNails!</p>
            <p>Best regards,<br>E.star SleekNails Team</p>
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

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    // If fetching all waitlists, must be admin
    if (!email && !decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // If fetching specific email waitlist, must be the owner or admin
    if (email && !decodedClaims.admin && email !== decodedClaims.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminDb = getAdminDb();
    
    if (email) {
      const lowerEmail = email.toLowerCase().trim();
      const promises = [adminDb.collection('waitlist').where('email', '==', email).get()];
      
      if (email !== lowerEmail) {
        promises.push(adminDb.collection('waitlist').where('email', '==', lowerEmail).get());
      }
      
      const snaps = await Promise.all(promises);
      const waitlistMap = new Map();
      
      snaps.forEach(snap => {
        snap.docs.forEach(doc => waitlistMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          status: 'WAITLIST'
        }));
      });
      
      return NextResponse.json(Array.from(waitlistMap.values()), { status: 200 });
    } else {
      const snapshot = await adminDb.collection('waitlist').get();
      const waitlists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        status: 'WAITLIST'
      }));
      return NextResponse.json(waitlists, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let decodedClaims;
    try {
      decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const adminDb = getAdminDb();
    const docRef = adminDb.collection('waitlist').doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const data = docSnap.data();

    if (!decodedClaims.admin && data?.email !== decodedClaims.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await docRef.delete();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
