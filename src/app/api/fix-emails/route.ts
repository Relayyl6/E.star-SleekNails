import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  const db = getAdminDb();
  const snap = await db.collection('bookings').get();
  
  let fixed = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.email && data.email !== data.email.toLowerCase().trim()) {
      await db.collection('bookings').doc(doc.id).update({
        email: data.email.toLowerCase().trim()
      });
      fixed++;
    }
  }
  
  return NextResponse.json({ success: true, fixed });
}
