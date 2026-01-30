// firebase-config.js - CONSISTENT VERSION 9.22.1
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaEkKJzyohsq6GK5GWygai0q3V0O_MkLY",
  authDomain: "web-foksi-9acb9.firebaseapp.com",
  projectId: "web-foksi-9acb9",
  storageBucket: "web-foksi-9acb9.firebasestorage.app",
  messagingSenderId: "811305636316",
  appId: "1:811305636316:web:42718618e39e56ee203f19",
  measurementId: "G-BN0KBQQMBJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };