import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    if (!claims.admin) return null;
    return claims;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const db = getAdminDb();
    const imagesSnap = await db.collection('gallery_images').orderBy('uploadedAt', 'desc').get();
    const images = imagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const settingsSnap = await db.collection('settings').doc('gallery').get();
    const data = settingsSnap.exists ? settingsSnap.data() : null;
    
    let testimonials = [
      { text: "The cleanest cuticle work I've ever had. My BIAB set lasted 5 weeks with zero lifting. Absolutely obsessed.", author: "Sarah M.", stars: 5 },
      { text: "She is a true artist! I showed her an inspiration picture and she executed it perfectly. I'm in love.", author: "Jessica T.", stars: 5 },
      { text: "Such a relaxing studio environment. I felt so pampered, and my natural nails have never been stronger.", author: "Elena R.", stars: 5 }
    ];

    if (data?.testimonials && Array.isArray(data.testimonials)) {
      testimonials = data.testimonials;
    } else if (data?.testimonial) {
      // fallback for old structure
      testimonials[0] = data.testimonial;
    }
    
    return NextResponse.json({ images, testimonials });
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const db = getAdminDb();
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (body.action === 'add_image') {
      const { url } = body;
      if (!url) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
      
      const newDoc = db.collection('gallery_images').doc();
      const newImage = {
        id: newDoc.id,
        url,
        isFavorite: false,
        uploadedAt: Date.now()
      };
      await newDoc.set(newImage);
      return NextResponse.json(newImage);
    } 
    
    if (body.action === 'update_testimonials') {
      const { testimonials } = body;
      await db.collection('settings').doc('gallery').set({ testimonials }, { merge: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getAdminDb();
    const body = await request.json();
    const { id, isFavorite, action, title, description, serviceId } = body;
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    if (action === 'update_details') {
      await db.collection('gallery_images').doc(id).update({
        title: title || '',
        description: description || '',
        serviceId: serviceId || null,
        updatedAt: Date.now()
      });
      return NextResponse.json({ success: true });
    }

    if (isFavorite !== undefined) {
      // Check count of favorites
      const favsSnap = await db.collection('gallery_images').where('isFavorite', '==', true).get();
      if (isFavorite && favsSnap.size >= 7) {
        return NextResponse.json({ error: 'Maximum 7 favorites allowed.' }, { status: 400 });
      }
      await db.collection('gallery_images').doc(id).update({ isFavorite });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    
    const db = getAdminDb();
    await db.collection('gallery_images').doc(id).delete();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
