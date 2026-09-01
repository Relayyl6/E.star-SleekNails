import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    if (!decodedClaims.admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { startDate, endDate, status } = body;

    const db = getAdminDb();
    let query = db.collection('bookings') as any;

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }
    if (status && status !== 'ALL') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return NextResponse.json({ success: true, count: 0, message: 'No bookings matched the criteria.' });
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return NextResponse.json({ success: true, count: snapshot.size });
  } catch (error: any) {
    console.error('Bulk DELETE Booking Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

