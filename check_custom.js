import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('services').where('isFreestyle', '==', true).get();
  q.forEach(doc => {
    console.log(doc.id, doc.data().name);
    console.log('hasExtras:', doc.data().hasExtras);
    console.log('extras:', doc.data().extras);
    console.log('hasLengths:', doc.data().hasLengths);
    console.log('hasDesignTiers:', doc.data().hasDesignTiers);
  });
}
check();
