// require('dotenv').config();

// // firebase-admin
// const admin = require("firebase-admin");
// const serviceAccount = require("../firebase-key.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// module.exports = db;

require('dotenv').config();
const admin = require("firebase-admin");
// const serviceAccount = require("../firebase-key.json");
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

class FirebaseAdmin {
    static db;

    static initialize() {
        if (!admin.apps.length) { // Memastikan Firebase hanya diinisialisasi sekali
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
        FirebaseAdmin.db = admin.firestore();
    }

    static getFirestore() {
        if (!FirebaseAdmin.db) {
            FirebaseAdmin.initialize(); // Inisialisasi jika belum dilakukan
        }
        return FirebaseAdmin.db;
    }
}

module.exports = FirebaseAdmin;
