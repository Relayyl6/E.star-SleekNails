import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');
  const type = searchParams.get('type') || 'ics'; // 'ics' | 'google'

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
  }

  const db = getAdminDb();
  const doc = await db.collection('bookings').doc(ref).get();

  if (!doc.exists) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const booking = doc.data()!;

  // Parse "YYYY-MM-DD" + "09:00 AM" into a Date
  const parseDateTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [timePart, ampm] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, minutes || 0);
  };

  const start = parseDateTime(booking.date, booking.time);

  // Estimate duration from items
  const totalMins = (booking.items || []).reduce((acc: number, item: any) => {
    const dur = item.duration || '';
    const hMatch = dur.match(/(\d+)h/);
    const mMatch = dur.match(/(\d+)\s*min/);
    return acc + (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
  }, 0);
  const end = new Date(start.getTime() + (totalMins || 60) * 60000);

  // Fetch settings for studio location
  const settingsDoc = await db.collection('storefront_config').doc('main').get();
  const settingsData = settingsDoc.exists ? settingsDoc.data() : {};
  const location = settingsData?.address || 'Lagos, Nigeria';

  // Build a detailed description including service names and their descriptions
  const serviceDetails = (booking.items || []).map((i: any) => {
    let text = `- ${i.name}`;
    if (i.selectedLength) text += `\n  • Length: ${i.selectedLength.name}`;
    if (i.selectedDesign) text += `\n  • Design: ${i.selectedDesign.name}`;
    if (i.selectedExtras?.length > 0) {
      i.selectedExtras.forEach((e: any) => text += `\n  • Extra: ${e.name}`);
    }
    if (i.description) text += `\n  ${i.description}`;
    return text;
  }).join('\n\n');

  const description = `Services Booked:\n${serviceDetails}\n\nReference Number: ${ref}`;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const toICSDate = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  if (type === 'google') {
    // Redirect to Google Calendar event creation URL
    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.set('action', 'TEMPLATE');
    gcalUrl.searchParams.set('text', 'E.star SleekNails Appointment');
    gcalUrl.searchParams.set('dates', `${toICSDate(start)}/${toICSDate(end)}`);
    gcalUrl.searchParams.set('details', description);
    gcalUrl.searchParams.set('location', location);
    return NextResponse.redirect(gcalUrl.toString());
  }

  // Default: generate .ics for Apple Calendar / Outlook
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//E.star SleekNails//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${ref}@estar-sleeknails`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    'SUMMARY:E.star SleekNails Appointment',
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location.replace(/,/g, '\\,')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="estar-appointment-${ref}.ics"`,
    },
  });
}
