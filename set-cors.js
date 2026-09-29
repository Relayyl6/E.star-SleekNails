
const fs = require("fs");
const { cert } = require("firebase-admin/app");
const { getStorage } = require("firebase-admin/storage");
const admin = require("firebase-admin");

const envFile = fs.readFileSync(".env.local", "utf8");
const env = {};
envFile.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2];
    if (val.startsWith("\"") && val.endsWith("\"")) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val.replace(/\\n/g, "\n");
  }
});

admin.initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY
  }),
  storageBucket: "ester-ec20e.appspot.com"
});

async function setCors() {
  const bucket = getStorage().bucket();
  const corsConfig = [
    {
      method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      origin: ["*"],
      responseHeader: ["Content-Type", "Authorization", "Content-Range", "Accept", "x-goog-resumable"],
      maxAgeSeconds: 3600
    }
  ];
  
  await bucket.setCorsConfiguration(corsConfig);
  console.log("CORS configured successfully on bucket: ester-ec20e.appspot.com");
}

setCors().catch(console.error);

