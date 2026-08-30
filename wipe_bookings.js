const admin = require('firebase-admin');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[match[1]] = val;
  }
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function wipeBookings() {
  console.log("Wiping existing bookings...");
  const oldBookings = await db.collection('bookings').get();
  const deleteBatch = db.batch();
  oldBookings.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log(`Deleted ${oldBookings.size} bookings.`);
  process.exit(0);
}

wipeBookings().catch(e => {
  console.error(e);
  process.exit(1);
});
