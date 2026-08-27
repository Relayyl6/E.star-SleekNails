import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// The emails that are granted ADMIN access
const ADMIN_EMAILS = [
  'oseghaleleonard39@gmail.com', // Replace with your dev email
  'owner@example.com' // Replace with the brand owner's email
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token using the Firebase Admin SDK
    let decodedToken;
    let authInstance;
    try {
      authInstance = getAdminAuth();
      decodedToken = await authInstance.verifyIdToken(token);
    } catch (adminError: any) {
      console.error('Admin SDK Error:', adminError);
      return NextResponse.json(
        { error: 'Server configuration error: Missing Firebase Admin Service Account Key in .env.local.' },
        { status: 500 }
      );
    }
    const email = decodedToken.email || '';
    
    // Check if the user is an admin
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const role = isAdmin ? 'ADMIN' : 'USER';

    // (Optional) You can set custom claims on the user here so they persist on the client
    if (isAdmin && !decodedToken.admin) {
      await authInstance.setCustomUserClaims(decodedToken.uid, { admin: true });
    }

    // Create session cookie (expires in 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await authInstance.createSessionCookie(token, { expiresIn });

    const response = NextResponse.json(
      { message: 'Login successful', role, uid: decodedToken.uid },
      { status: 200 }
    );
    
    // Set the cookie
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    console.log(`[Auth]: ${role} logged in: ${email}`);

    return response;

  } catch (error: any) {
    console.error('[Auth Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
