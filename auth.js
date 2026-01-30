// auth.js - FIXED VERSION
import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut 
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

// Login function - SIMPLIFIED VERSION
export async function loginUser(username, password, role) {
    try {
        console.log("Login attempt for:", username, "Role:", role);
        
        // Format email - FIXED: menggunakan @gmail.com
        const email = `${username}@gmail.com`;
        console.log("Using email:", email);
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Auth success! UID:", user.uid);
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            throw new Error("User data not found. Please contact admin.");
        }
        
        const userData = userDoc.data();
        console.log("User data from Firestore:", userData);
        
        // Check role
        if (userData.role !== role) {
            throw new Error(`Wrong role. Account is ${userData.role}, not ${role}`);
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
        
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        // Redirect based on role
        if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'anggota-dashboard.html';
        }
        
        return { success: true, user: userToStore };
        
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        
        let errorMessage = "Login failed";
        
        // Common error translations
        if (error.code === 'auth/invalid-credential' || 
            error.code === 'auth/wrong-password' || 
            error.code === 'auth/user-not-found') {
            errorMessage = "Username or password incorrect";
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = "Too many attempts. Try again later";
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = "Network error. Check your connection";
        } else {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

// Register new user (admin only)
export async function registerUser(userData) {
    try {
        const email = `${userData.username}@gmail.com`;
        console.log("Registering:", email);
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
        
        // Save to Firestore
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
        
        return { 
            success: true, 
            message: "Account created successfully",
            userId: userCredential.user.uid 
        };
        
    } catch (error) {
        console.error("Registration error:", error);
        throw new Error(error.code === 'auth/email-already-in-use' 
            ? "Username already exists" 
            : error.message);
    }
}

// Check if user is logged in
export function checkAuth() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
}

// Logout function
export function logoutUser() {
    localStorage.removeItem('user');
    signOut(auth).catch(console.error);
    window.location.href = 'index.html';
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
