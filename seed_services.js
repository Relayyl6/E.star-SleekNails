const admin = require('firebase-admin');

// Since dotenv is not installed in the container, we can just load from .env.local manually
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

const servicesList = [
  // Acrylic Nail Sets — Plain
  {
    id: "acrylic-nail-overlay",
    name: "Acrylic Nail Overlay",
    price: "₦10,000",
    duration: "1h 15min",
    description: "A clean acrylic overlay applied directly over the natural nails for added strength and a polished finish. This service reinforces your natural nails with a layer of acrylic without adding significant artificial length. It is finished in a simple, plain style and is ideal if you want stronger, neater-looking natural nails while keeping a relatively natural appearance.",
    category: "Acrylic Nail Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "plain-acrylic-short",
    name: "Short — Plain Acrylic Full Set",
    price: "₦15,000",
    duration: "1h 30min",
    description: "A plain acrylic full set in a short, practical length with a clean and polished finish. This service includes the application and shaping of a complete acrylic nail set at a short length. The nails are finished in a simple plain style, making them suitable for an understated everyday look while still providing the durability and structure of acrylic.",
    category: "Acrylic Nail Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "plain-acrylic-medium",
    name: "Medium — Plain Acrylic Full Set",
    price: "₦15,000",
    duration: "1h 45min",
    description: "A plain acrylic full set shaped to a medium length for a balanced, polished look. This service provides a complete acrylic extension set at a medium length. Each nail is shaped and refined before being finished in a clean, plain style, giving you a versatile look that works well for both everyday wear and special occasions.",
    category: "Acrylic Nail Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "plain-acrylic-long",
    name: "Long — Plain Acrylic Full Set",
    price: "₦18,000",
    duration: "2h",
    description: "A long-length acrylic full set with a simple, elegant finish. This service includes a complete acrylic extension set built to a long length. The nails are carefully shaped, refined and finished in a plain style, giving you the additional length and defined appearance associated with long acrylic nails.",
    category: "Acrylic Nail Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "plain-acrylic-xl",
    name: "XL/XXL — Plain Acrylic Full Set",
    price: "₦20,000",
    duration: "2h 30min",
    description: "An extra-long XL/XXL acrylic set designed for maximum length and a bold finish. This service is designed for clients who prefer significantly longer acrylic extensions. The nails are constructed, shaped and refined at an XL/XXL length before receiving a clean, plain finish. The increased length requires additional application and shaping time.",
    category: "Acrylic Nail Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // Extras
  {
    id: "french-tip-addon",
    name: "French Tip Add-On",
    price: "₦2,000",
    duration: "20min",
    description: "Add a classic French-tip finish to your manicure for a clean and timeless look. This add-on introduces a defined French-tip design to your existing nail service. It adds a refined contrast to the nail while maintaining a simple and elegant appearance, making it a versatile choice for everyday or occasion wear.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "chrome-addon",
    name: "Chrome Nail Add-On",
    price: "₦3,000",
    duration: "25min",
    description: "Add a reflective chrome finish for a sleek, glossy and eye-catching effect. This add-on gives your manicure a smooth metallic chrome appearance. It can be applied over your chosen base colour or nail design to create a highly reflective finish with a modern, polished look.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "marble-addon",
    name: "Marble Nail Art Add-On",
    price: "₦3,000",
    duration: "30min",
    description: "Add a marble-inspired nail design with elegant flowing patterns and a sophisticated finish. This nail-art add-on creates a marble effect across the selected nails, producing organic lines and colour movement inspired by natural marble. It adds visual detail while keeping the overall manicure sophisticated and versatile.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "3d-art-addon",
    name: "3D Nail Art Add-On",
    price: "From ₦3,000",
    duration: "40min",
    description: "Add raised 3D details to your nails for a dimensional and creative finish. This add-on allows for decorative three-dimensional elements to be incorporated into the nail design. Because the complexity and amount of 3D work can vary, the final price may increase beyond the starting price depending on the requested design.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "hand-drawn-addon",
    name: "Hand-Drawn Nail Art Add-On",
    price: "From ₦3,000",
    duration: "45min",
    description: "Custom hand-drawn artwork created directly on the nails for a personalized finish. This service adds individually hand-painted artwork to your manicure. Designs can range from simple illustrations and patterns to more detailed custom artwork, with the final price and time depending on the complexity of the requested design.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "nail-charm-addon",
    name: "Nail Charm Add-On",
    price: "From ₦3,000",
    duration: "25min",
    description: "Add decorative charms and embellishments to your nails for an elevated, statement look. This add-on incorporates decorative nail charms or embellishments into your manicure. The placement and number of charms can be customized, while the final price may vary depending on the selected charms and complexity of the design.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "cat-eye-addon",
    name: "Cat Eye Nail Design Add-On",
    price: "₦5,000",
    duration: "30min",
    description: "A magnetic cat-eye effect that creates a luminous, dimensional appearance on the nails. This design uses a cat-eye style polish to create a shifting, reflective effect across the nail surface. The result is a sleek and dimensional finish that changes subtly as it catches the light.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "aura-addon",
    name: "Aura Nail Design Add-On",
    price: "₦5,000",
    duration: "40min",
    description: "A soft aura-inspired design featuring a blended glow of colour for a modern, artistic finish. This add-on creates an aura-style effect using softly blended colours that radiate from the centre or selected area of the nail. It gives the manicure a subtle gradient and glowing appearance while allowing for creative colour combinations.",
    category: "Extras",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // Gel X Nail Sets — Plain
  {
    id: "gel-x-short",
    name: "Short — Plain Gel X Full Set",
    price: "₦15,000",
    duration: "1h 30min",
    description: "A plain Gel X nail extension set in a short length with a clean, polished finish. This service provides a complete Gel X extension set using pre-formed gel extensions at a short length. The extensions are applied, shaped and refined before being finished in a simple plain style for a neat and versatile result.",
    category: "Plain Gel X Nail Set",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "gel-x-medium",
    name: "Medium — Plain Gel X Full Set",
    price: "₦15,000",
    duration: "1h 45min",
    description: "A plain Gel X extension set in a medium length for a balanced and elegant finish. This service applies Gel X extensions at a medium length, followed by shaping and refinement to create a smooth and uniform set. The plain finish keeps the final look clean and understated while providing the added length of gel extensions.",
    category: "Plain Gel X Nail Set",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "gel-x-long",
    name: "Long — Plain Gel X Full Set",
    price: "₦18,000",
    duration: "2h",
    description: "A long Gel X extension set finished in a simple, clean and polished style. This service provides long Gel X extensions for clients who want additional length with the lightweight appearance of gel extensions. Each nail is applied, shaped and refined before receiving a plain finish.",
    category: "Plain Gel X Nail Set",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // BIAB on Natural Nails
  {
    id: "biab-plain",
    name: "Plain — BIAB on Natural Nails",
    price: "₦15,000",
    duration: "1h 15min",
    description: "A BIAB overlay on natural nails with a clean, plain finish that helps create a neat and polished manicure. Builder in a Bottle (BIAB) is applied directly to the natural nails to provide structure and a durable, smooth finish without adding traditional acrylic extensions. The service is completed in a plain style for a simple and sophisticated result.",
    category: "BIAB on Natural Nails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "biab-french",
    name: "Basic French — BIAB on Natural Nails",
    price: "₦15,000",
    duration: "1h 30min",
    description: "A structured BIAB manicure on natural nails finished with a classic French-tip design. This service combines a BIAB overlay with a clean French-tip finish. It strengthens and structures the natural nails while adding the timeless contrast of a French manicure for a refined and polished appearance.",
    category: "BIAB on Natural Nails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "biab-cateye",
    name: "Cat Eye — BIAB on Natural Nails",
    price: "₦15,000",
    duration: "1h 30min",
    description: "A BIAB manicure on natural nails enhanced with a luminous cat-eye effect. This service combines the structure and durability of a BIAB overlay with the dimensional appearance of cat-eye polish. The magnetic finish creates a reflective band of light across the nails for a subtle but eye-catching result.",
    category: "BIAB on Natural Nails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // Gel Stick-On Sets — Plain
  {
    id: "stickon-short",
    name: "Short — Plain Gel Stick-On Set",
    price: "₦8,000",
    duration: "45min",
    description: "A plain short-length gel stick-on nail set for a quick and polished manicure. This service provides a ready-made gel-style nail set applied to the natural nails at a short length. The nails are finished in a simple plain style, offering a convenient way to achieve a clean, uniform manicure without the longer application process of a traditional extension set.",
    category: "Gel Stick-On Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "stickon-medium",
    name: "Medium — Plain Gel Stick-On Set",
    price: "₦12,000",
    duration: "50min",
    description: "A medium-length plain gel stick-on set offering a clean and polished finish. This service applies medium-length gel stick-on extensions to the natural nails and finishes them in a simple plain style. It is a convenient option for clients who want additional length and a uniform manicure with a relatively quick application.",
    category: "Gel Stick-On Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "stickon-long",
    name: "Long — Plain Gel Stick-On Set",
    price: "₦12,000",
    duration: "1h",
    description: "A long-length plain gel stick-on set for a sleek and extended nail look. This service provides long gel stick-on extensions with a simple, plain finish. The extensions are applied and refined to create an even, polished appearance while providing the additional length desired for a more pronounced manicure.",
    category: "Gel Stick-On Set — Plain",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // Toenails
  {
    id: "acrylic-toenail",
    name: "Acrylic Toenail Set",
    price: "₦10,000",
    duration: "1h",
    description: "Acrylic enhancement for the toenails to create a neat, shaped and polished appearance. This service uses acrylic to enhance and shape the toenails, helping create a more uniform appearance. The nails are carefully prepared and finished for a clean result that complements your overall pedicure look.",
    category: "Toenails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "gel-polish-toenails",
    name: "Gel Polish on Toenails",
    price: "₦3,000",
    duration: "30min",
    description: "A gel polish application on the toenails for a smooth, glossy and durable finish. This service applies gel polish to the toenails and cures it to create a smooth, high-shine finish. It is a straightforward option for adding colour and polish to the toes without adding artificial nail extensions.",
    category: "Toenails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "big-toe-gel",
    name: "Big Toe Gel",
    price: "₦3,500",
    duration: "30min",
    description: "Gel enhancement specifically for the big toenails for a clean and polished finish. This service focuses on the big toes, using gel to enhance and finish the nails neatly. It is suitable when the big toenails need additional structure or a more refined appearance without treating all the toenails.",
    category: "Toenails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "fixed-toes-gel",
    name: "Fixed Toes with Gel",
    price: "₦4,000",
    duration: "40min",
    description: "Gel treatment for fixing and enhancing the appearance of the toenails. This service is designed for toenails that require fixing or additional support before receiving a gel finish. The nail is prepared and refined before gel is applied to create a smoother, more uniform appearance.",
    category: "Toenails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "acrylic-bigtoe-gel",
    name: "Acrylic Big Toe with Gel Polish",
    price: "₦5,000",
    duration: "45min",
    description: "Acrylic enhancement on the big toenails finished with gel polish for a polished, durable result. This service combines acrylic enhancement on the big toenails with a gel-polish finish. The acrylic provides structure and shape while the gel polish adds colour and a smooth, glossy finish.",
    category: "Toenails",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },

  // Others
  {
    id: "soak-off",
    name: "Nail Soak-Off / Removal",
    price: "₦2,500",
    duration: "40min",
    description: "Professional removal of existing nail enhancements while taking care to protect the natural nails. This service removes existing acrylic, gel or other nail enhancements so the natural nails can be properly cleaned and prepared for a new service. The removal process is performed carefully to minimize unnecessary stress or damage to the natural nail surface.",
    category: "Others",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  },
  {
    id: "plain-acrylic-refill",
    name: "Plain Acrylic Refill",
    price: "₦12,000",
    duration: "1h 15min",
    description: "A maintenance refill for existing acrylic nails, restoring the growth area and refreshing the plain finish. This service maintains an existing acrylic set by filling the area where the natural nail has grown out and restoring the structure and appearance of the nails. The set is reshaped and refinished in a plain style to give the manicure a fresh, neat appearance.",
    category: "Others",
    images: ["https://placehold.co/600x400/1a1414/ffffff.png?text=Image+Coming+Soon"]
  }
];

async function seed() {
  console.log("Wiping existing services...");
  const oldServices = await db.collection('services').get();
  const deleteBatch = db.batch();
  oldServices.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log("Old services deleted.");

  console.log("Seeding 29 new services...");
  const addBatch = db.batch();
  for (const s of servicesList) {
    const ref = db.collection('services').doc(s.id);
    addBatch.set(ref, {
      ...s,
      createdAt: new Date().toISOString()
    });
  }
  await addBatch.commit();
  console.log("Done seeding new services!");
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
