import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

import { getAdminDb } from '@/lib/firebase/admin';

import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(req: Request) {
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
        return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await req.json();
    const db = getAdminDb();
    
    await db.collection('storefront_config').doc('main').set(body, { merge: true });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('storefront_config').doc('main').get();
    
    if (snap.exists) {
      return NextResponse.json(snap.data(), { status: 200 });
    } else {
      return NextResponse.json({}, { status: 200 });
    }
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
