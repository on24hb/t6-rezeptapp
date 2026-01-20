// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvGWeFefOwMxlW0eQ5Oj9ZZJn5uIcmIkI",
  authDomain: "rezept-app-pwa.firebaseapp.com",
  projectId: "rezept-app-pwa",
  storageBucket: "rezept-app-pwa.firebasestorage.app",
  messagingSenderId: "187651146552",
  appId: "1:187651146552:web:fcd68985e3c10f66def7cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore mit der App-Instanz verknüpfen
const db = getFirestore(app);


// Exportieren
export { db };
