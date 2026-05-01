const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Check if Firebase credentials are available in environment variables
let privateKey;
try {
  // Try to parse the private key from environment variable
  privateKey = process.env.FIREBASE_PRIVATE_KEY ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY) : undefined;
} catch (error) {
  // If parsing fails, use the raw string with newline replacement
  privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;
}

const firebaseCredentials = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: privateKey
};

// Initialize Firebase Admin SDK if credentials are available
let firebaseAdmin = null;

if (firebaseCredentials.projectId && firebaseCredentials.clientEmail && firebaseCredentials.privateKey) {
  try {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials)
    });
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
} else {
  console.warn('Firebase credentials not found in environment variables. Google Sign-In will not work.');
}

/**
 * Verify Firebase ID token
 * @param {string} idToken - The ID token to verify
 * @returns {Promise<Object>} - The decoded token
 */
async function verifyIdToken(idToken) {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Invalid ID token: ${error.message}`);
  }
}

module.exports = {
  verifyIdToken,
  isInitialized: () => !!firebaseAdmin
};