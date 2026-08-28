import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 });

  const db = getAdminDb();
  const snap = await db.collection('bookings').where('email', '==', email).get();
  
  const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return NextResponse.json({ count: bookings.length, bookings });
}
