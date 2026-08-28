
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();
(async () => {
  const snapshot = await db.collection('bookings').get();
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.date && data.date.includes('T')) {
      const d = new Date(data.date);
      d.setHours(d.getHours() + 1); // Adjust for Nigeria (UTC+1)
      const pad = n => n.toString().padStart(2, '0');
      const newDateStr = d.getUTCFullYear() + '-' + pad(d.getUTCMonth()+1) + '-' + pad(d.getUTCDate());
      await doc.ref.update({ date: newDateStr });
      count++;
      console.log('Fixed', doc.id, data.date, '->', newDateStr);
    }
  }
  console.log('Fixed', count, 'bookings');
})();

