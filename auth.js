// auth.js - FIXED VERSION WITH @gmail.com - UPDATED 12.8.0
import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Login function
export async function loginUser(username, password, role) {
    try {
        console.log("=== LOGIN PROCESS START ===");
        console.log("Username:", username, "Role:", role);
        
        // Format email for Firebase Auth - USING @gmail.com
        const email = `${username}@gmail.com`;
        console.log("Email for auth:", email);
        
        // Sign in with Firebase Auth
        console.log("Attempting Firebase Auth sign in...");
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Firebase Auth SUCCESS - UID:", user.uid);
        
        // Get user data from Firestore
        console.log("Fetching user data from Firestore...");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            console.error("User document not found in Firestore");
            throw new Error("Data pengguna tidak ditemukan di database. Silakan hubungi admin.");
        }
        
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);
        
        // Check if user has a role
        if (!userData.role) {
            console.error("User has no role in Firestore");
            throw new Error("Role pengguna tidak ditemukan");
        }
        
        // Check role
        if (userData.role !== role) {
            console.error(`Role mismatch. Expected: ${role}, Got: ${userData.role}`);
            throw new Error(`Role tidak sesuai. Akun ini adalah ${userData.role || 'tidak diketahui'}, bukan ${role}`);
        }
        
        // Store user data in localStorage
        const userToStore = {
            uid: user.uid,
            username: userData.username || username,
            nama: userData.nama || 'User',
            role: userData.role,
            jabatan: userData.jabatan || '',
            regional: userData.regional || '',
            sekolah: userData.sekolah || '',
            email: userData.email || email
        };
        
        console.log("Storing user to localStorage:", userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        console.log("Login SUCCESS! Redirecting...");
        
        // Redirect based on role
        setTimeout(() => {
            if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'anggota-dashboard.html';
            }
        }, 100);
        
        return { success: true, user: userToStore };
        
    } catch (error) {
        console.error("=== LOGIN ERROR ===");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        // Translate error messages
        let errorMessage = error.message;
        
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-credential':
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    errorMessage = "Username atau password salah. Pastikan username dan password benar.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "Akun ini dinonaktifkan. Hubungi admin.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Terlalu banyak percobaan gagal. Coba lagi nanti.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Koneksi internet bermasalah. Periksa koneksi Anda.";
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = "Metode login tidak diizinkan. Hubungi admin.";
                    break;
                default:
                    errorMessage = `Login gagal: ${error.code}`;
            }
        }
        
        throw new Error(errorMessage);
    }
}

// Register new user (admin only)
export async function registerUser(userData) {
    try {
        // Format email with @gmail.com
        const email = `${userData.username}@gmail.com`;
        console.log("Registering user with email:", email);
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
        
        // Save additional data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username: userData.username,
            nama: userData.nama,
            jabatan: userData.jabatan,
            regional: userData.regional,
            sekolah: userData.sekolah,
            role: 'anggota',
            email: email,
            createdAt: new Date().toISOString()
        });
        
        console.log("User registered successfully:", userCredential.user.uid);
        
        return { 
            success: true, 
            message: "Akun berhasil dibuat",
            userId: userCredential.user.uid 
        };
        
    } catch (error) {
        console.error("Registration error:", error);
        
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = "Username sudah digunakan. Coba username lain.";
        } else if (error.code === 'auth/weak-password') {
            errorMessage = "Password terlalu lemah. Minimal 6 karakter.";
        }
        
        throw new Error(errorMessage);
    }
}

// Check if user is logged in
export function checkAuth() {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            console.log("No user found in localStorage");
            return null;
        }
        
        const user = JSON.parse(userStr);
        console.log("User from localStorage:", user);
        return user;
        
    } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem('user');
        return null;
    }
}

// Logout function
export function logoutUser() {
    console.log("Logging out user...");
    localStorage.removeItem('user');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 100);
}

// Check if username exists
export async function checkUsernameExists(username) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking username:", error);
        throw error;
    }
}