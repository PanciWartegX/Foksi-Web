// auth.js
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
        // Format email for Firebase Auth (username + @foksi.com)
        const email = `${username}@foksi.com`;
        
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check role
            if (userData.role !== role) {
                throw new Error("Role tidak sesuai");
            }
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                username: userData.username,
                nama: userData.nama,
                role: userData.role,
                jabatan: userData.jabatan,
                regional: userData.regional,
                sekolah: userData.sekolah
            }));
            
            // Redirect based on role
            if (role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'anggota-dashboard.html';
            }
        } else {
            throw new Error("Data pengguna tidak ditemukan");
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

// Register new user (admin only)
export async function registerUser(userData) {
    try {
        // Create user in Firebase Auth
        const email = `${userData.username}@foksi.com`;
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            email, 
            userData.password
        );
        
        // Save additional data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            username: userData.username,
            nama: userData.nama,
            jabatan: userData.jabatan,
            regional: userData.regional,
            sekolah: userData.sekolah,
            role: 'anggota',
            createdAt: new Date().toISOString()
        });
        
        return { success: true, message: "Akun berhasil dibuat" };
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

// Check if user is logged in
export function checkAuth() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Logout function
export function logoutUser() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Check if username exists
export async function checkUsernameExists(username) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}