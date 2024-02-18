require('dotenv').config();

// firebase-admin
const admin = require("firebase-admin");
// const serviceAccount = require("../firebase-key.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;