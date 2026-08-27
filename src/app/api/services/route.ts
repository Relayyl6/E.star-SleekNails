import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    const db = getAdminDb();
    const snap = await db.collection('services').get();
    const services = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return NextResponse.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    
    await db.collection('services').doc(id).set({ id, ...data }, { merge: true });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    
    const db = getAdminDb();
    await db.collection('services').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    
    // Perform partial update
    await db.collection('services').doc(id).update(data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
