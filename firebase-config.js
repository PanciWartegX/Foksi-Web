// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Konfigurasi terbaru sesuai yang Anda lampirkan
const firebaseConfig = {
  apiKey: "AIzaSyBaEkKJzyohsq6GK5GWygai0q3V0O_MkLY",
  authDomain: "web-foksi-9acb9.firebaseapp.com",
  projectId: "web-foksi-9acb9",
  storageBucket: "web-foksi-9acb9.firebasestorage.app",
  messagingSenderId: "811305636316",
  appId: "1:811305636316:web:42718618e39e56ee203f19", // Menggunakan appId terbaru
  measurementId: "G-BN0KBQQMBJ" // Menggunakan measurementId terbaru
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Export agar bisa digunakan di auth.js dan database.js
export { app, analytics, auth, db };