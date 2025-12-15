import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Construct an absolute path to the service account file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(
  __dirname,
  "..",
  "firebase",
  "chai-ai-e2041-firebase-adminsdk-fbsvc-344079e4b1.json"
);

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Check if Firebase app is already initialized to prevent re-initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
