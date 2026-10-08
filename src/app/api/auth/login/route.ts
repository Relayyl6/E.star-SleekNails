import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { getAdminAuth } from '@/lib/firebase/admin';

const DEFAULT_ADMINS = ['oseghaleleonard39@gmail.com', 'peteratambaesther@gmail.com'];
const getAdminEmails = () => {
  if (process.env.ADMIN_EMAILS) {
    return process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
  }
  return DEFAULT_ADMINS;
};

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

    let decodedToken;
    let authInstance;
    try {
      authInstance = getAdminAuth();
      decodedToken = await authInstance.verifyIdToken(token);
    } catch (adminError: any) {
      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }
    const email = decodedToken.email || '';
    
    const isAdmin = getAdminEmails().includes(email.toLowerCase());
    const role = isAdmin ? 'ADMIN' : 'USER';

    if (isAdmin && !decodedToken.admin) {
      await authInstance.setCustomUserClaims(decodedToken.uid, { admin: true });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await authInstance.createSessionCookie(token, { expiresIn });

    const response = NextResponse.json(
      { message: 'Login successful', role, uid: decodedToken.uid },
      { status: 200 }
    );
    
    response.cookies.set({
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn / 1000,
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

