import "dotenv/config";
import admin from "firebase-admin";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is NOT loaded");
}

const serviceAccount = JSON.parse(raw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
