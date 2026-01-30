// firebase-config.js - Firebase v12.8.0
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_APiU6azAWX5w5qANpInI-6QWX-IDzeA",
  authDomain: "web-absen-13c0f.firebaseapp.com",
  projectId: "web-absen-13c0f",
  storageBucket: "web-absen-13c0f.firebasestorage.app",
  messagingSenderId: "1026553673394",
  appId: "1:1026553673394:web:9aee69887b5b635b727bab"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };