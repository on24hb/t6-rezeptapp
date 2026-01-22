// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from 'firebase/firestore'
import { getAuth } from "firebase/auth";

// Firebase configuration is loaded from environment variables (Vite requires VITE_ prefix)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Helpful runtime check in development
if (!firebaseConfig.apiKey) {
  throw new Error(
    'Missing Firebase config in environment variables. Create a .env file and set VITE_FIREBASE_* variables (see .env.example).',
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Firestore mit der App-Instanz verknüpfen
const db = getFirestore(app)

// Authentifizierung mit der App-Instanz verknüpfen
const auth = getAuth(app);

// Exportieren
export { db, auth }
