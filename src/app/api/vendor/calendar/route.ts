import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_ADMINS = ['oseghaleleonard39@gmail.com', 'peteratambaesther@gmail.com'];
const getAdminEmails = () => {
  if (process.env.ADMIN_EMAILS) {
    return process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());
  }
  return DEFAULT_ADMINS;
};

async function verifyAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    if (decodedToken.email && getAdminEmails().includes(decodedToken.email.toLowerCase())) {
      return decodedToken;
    }
    if (decodedToken.admin) {
      return decodedToken;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// GET: Fetch bookings, store operating hours, and services catalog for calendar
export async function GET(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // e.g. "2026-10"
    const db = getAdminDb();

    // Fetch bookings
    const bookingsSnap = await db.collection('bookings').get();
    let bookings = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter by month if provided (e.g. "2026-10")
    if (month) {
      bookings = bookings.filter((b: any) => b.date && b.date.startsWith(month));
    }

    // Sort by date ascending, then time
    bookings.sort((a: any, b: any) => {
      const cmpDate = (a.date || '').localeCompare(b.date || '');
      if (cmpDate !== 0) return cmpDate;
      return (a.time || '').localeCompare(b.time || '');
    });

    // Fetch store operating hours from storefront config
    let storeHours: any[] = [];
    try {
      const configDoc = await db.collection('storefront_config').doc('main').get();
      if (configDoc.exists && configDoc.data()?.hours) {
        const raw = configDoc.data()?.hours;
        storeHours = Array.isArray(raw) ? raw : Object.values(raw);
      }
    } catch (e) {
      console.error('Error fetching storefront hours:', e);
    }

    // Fetch services catalog so vendor can pick a service in the modal
    let services: any[] = [];
    try {
      const servicesSnap = await db.collection('services').get();
      services = servicesSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        duration: doc.data().duration
      }));
    } catch (e) {
      console.error('Error fetching services catalog:', e);
    }

    return NextResponse.json({
      bookings,
      storeHours,
      services
    }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/vendor/calendar Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Lock time slot(s) / create an offline booking
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      date,
      time, // string or array of strings, e.g. "12:00 PM" or ["09:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      instagram = '',
      notes = '',
      serviceName = '',
      total = 0,
      isBlocked = true
    } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    const timesToLock: string[] = Array.isArray(time) ? time : [time];
    if (timesToLock.length === 0) {
      return NextResponse.json({ error: 'At least one time slot is required' }, { status: 400 });
    }

    const db = getAdminDb();
    const createdDocs: any[] = [];

    for (const slotTime of timesToLock) {
      // Check if slot is already occupied
      const existing = await db.collection('bookings')
        .where('date', '==', date)
        .where('time', '==', slotTime)
        .get();

      const activeExisting = existing.docs.find(doc => {
        const s = doc.data().status;
        return s !== 'CANCELLED';
      });

      if (activeExisting) {
        // If already booked, skip or error
        if (timesToLock.length === 1) {
          return NextResponse.json({
            error: `Slot ${slotTime} on ${date} is already occupied by ${activeExisting.data().firstName || 'another booking'}.`
          }, { status: 409 });
        }
        continue;
      }

      const randomRefNum = Math.floor(100000 + Math.random() * 900000);
      const isBlockOnly = isBlocked && !firstName && !phone;
      const docId = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const formatPrice = (val: any) => {
        if (!val) return '₦0';
        const num = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10) || 0;
        return `₦${num.toLocaleString()}`;
      };

      const bookingPayload: any = {
        id: docId,
        ref: isBlockOnly ? `BLK-${randomRefNum}` : `OFF-${randomRefNum}`,
        date,
        time: slotTime,
        status: 'CONFIRMED',
        source: 'OFFLINE',
        isOffline: true,
        isBlocked: isBlockOnly,
        firstName: firstName.trim() || (isBlockOnly ? 'Blocked' : 'Walk-in'),
        lastName: lastName.trim() || (isBlockOnly ? 'Slot' : 'Client'),
        email: email.trim(),
        phone: phone.trim(),
        instagram: instagram.trim().replace(/^@/, ''),
        notes: notes.trim(),
        serviceName: serviceName.trim(),
        items: serviceName.trim()
          ? [{ name: serviceName.trim(), price: formatPrice(total), quantity: 1 }]
          : [{ name: isBlockOnly ? 'Blocked Time Slot' : 'Walk-in / Offline Appointment', price: formatPrice(total), quantity: 1 }],
        total: formatPrice(total),
        createdAt: new Date().toISOString()
      };

      await db.collection('bookings').doc(docId).set(bookingPayload);
      createdDocs.push(bookingPayload);
    }

    if (createdDocs.length === 0) {
      return NextResponse.json({ error: 'All specified slots on this date are already occupied.' }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully locked ${createdDocs.length} slot(s).`,
      count: createdDocs.length,
      bookings: createdDocs
    }, { status: 200 });
  } catch (error: any) {
    console.error('POST /api/vendor/calendar Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Unlock a blocked slot / delete an offline booking
export async function DELETE(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('bookings').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Slot successfully unlocked and available for online booking.'
    }, { status: 200 });
  } catch (error: any) {
    console.error('DELETE /api/vendor/calendar Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update details of an existing offline booking or locked slot
export async function PATCH(request: Request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    const db = getAdminDb();
    const docRef = db.collection('bookings').doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    await docRef.update({
      ...data,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Booking updated successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('PATCH /api/vendor/calendar Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
