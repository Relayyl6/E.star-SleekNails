const admin = require('firebase-admin');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[match[1].trim()] = val.replace(/\\n/g, '\n');
  }
});

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }),
  });
}

const db = admin.firestore();

async function updateSettings() {
  const settingsRef = db.collection('storefront_config').doc('main');
  
  // We remove depositPercentage in favour of depositAmount
  // and update all the details the user requested.
  await settingsRef.set({
    adminEmail: "peteratambaesther@gmail.com",
    bankDetails: "Moniepoint, 7049022919, E.star SleekNails Luxury studio/ E.star SleekNails",
    depositAmount: 5000,
    address: "Abuja, Gwarimpa, Azah Scents in front of Drugmart and Greens 2nd Avenue gwarimpa",
    mapUrl: "https://maps.app.goo.gl/C5wPhgWKkGxcmtL46?g_st=ic",
    instagram: "@estar.sleeknails"
  }, { merge: true });

  // Let's also remove depositPercentage if it exists just to keep it clean.
  await settingsRef.update({
    depositPercentage: admin.firestore.FieldValue.delete()
  });

  console.log("Settings successfully updated!");
  process.exit(0);
}

updateSettings().catch(e => {
  console.error(e);
  process.exit(1);
});
