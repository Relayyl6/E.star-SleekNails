const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('src/lib/firebase/serviceAccountKey.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const customService = {
    id: 'freestyle-custom-set',
    name: 'Freestyle / Custom Set',
    category: 'Others',
    price: 'Custom Quote',
    basePrice: 0,
    duration: 'TBD',
    description: "Not sure what you want? Upload your inspiration pictures and describe your dream set. We will review and provide a custom quotation!",
    image: 'https://placehold.co/600x600/F8D9CE/1A1414?text=Custom+Set',
    images: ['https://placehold.co/600x600/F8D9CE/1A1414?text=Custom+Set'],
    hasLengths: false,
    hasDesignTiers: false,
    hasExtras: false,
    isFreestyle: true
  };

  await db.collection('services').doc(customService.id).set(customService);
  console.log('Added freestyle service!');
}

run().catch(console.error);
