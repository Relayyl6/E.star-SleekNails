const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  // Use env variables initialized via next.js or we can just patch it via API
}
