// database.js - UPDATED VERSION
import { db } from './firebase-config.js';
import { 
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Absensi Functions
export async function submitAbsensi(absensiData) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
            throw new Error("User tidak ditemukan. Silakan login kembali.");
        }
        
        console.log("Submitting absensi for user:", user.uid);
        
        // Check if already submitted today
        const today = new Date().toISOString().split('T')[0];
        const absensiQuery = query(
            collection(db, "absensi"),
            where("userId", "==", user.uid),
            where("tanggal", "==", today)
        );
        
        const existingAbsensi = await getDocs(absensiQuery);
        if (!existingAbsensi.empty) {
            throw new Error("Anda sudah mengisi absensi hari ini");
        }
        
        // Get absensi settings
        const settingsDoc = await getDoc(doc(db, "settings", "absensi"));
        if (!settingsDoc.exists()) {
            throw new Error("Absensi belum diatur");
        }
        
        const settings = settingsDoc.data();
        console.log("Absensi settings:", settings);
        
        // Check if absensi is open
        if (!isAbsensiOpen(settings)) {
            throw new Error("Absensi sudah ditutup");
        }
        
        // Add absensi record
        const absensiRecord = {
            userId: user.uid,
            nama: user.nama,
            jabatan: user.jabatan,
            regional: user.regional,
            sekolah: user.sekolah,
            status: absensiData.status,
            keterangan: absensiData.keterangan || '',
            tanggal: today,
            waktu: new Date().toLocaleTimeString('id-ID', { hour12: false }),
            timestamp: Timestamp.now(),
            kegiatan: settings.nama_kegiatan
        };
        
        console.log("Saving absensi record:", absensiRecord);
        await addDoc(collection(db, "absensi"), absensiRecord);
        
        return { success: true, message: "Absensi berhasil disimpan" };
    } catch (error) {
        console.error("Error submitting absensi:", error);
        throw error;
    }
}

function isAbsensiOpen(settings) {
    if (!settings) return false;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (settings.tanggal !== today) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime = timeToMinutes(settings.jam_buka);
    const closeTime = timeToMinutes(settings.jam_tutup);
    
    return currentTime >= openTime && currentTime <= closeTime;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Settings Functions
export async function saveAbsensiSettings(settings) {
    try {
        await setDoc(doc(db, "settings", "absensi"), {
            nama_kegiatan: settings.nama_kegiatan,
            tanggal: settings.tanggal,
            jam_buka: settings.jam_buka,
            jam_tutup: settings.jam_tutup,
            updatedAt: Timestamp.now()
        });
        
        return { success: true, message: "Pengaturan berhasil disimpan" };
    } catch (error) {
        console.error("Error saving settings:", error);
        throw error;
    }
}

export async function getAbsensiSettings() {
    try {
        const docRef = doc(db, "settings", "absensi");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting settings:", error);
        throw error;
    }
}

// Data Functions
export async function getAllAbsensi(startDate = null, endDate = null) {
    try {
        let q;
        
        if (startDate && endDate) {
            q = query(
                collection(db, "absensi"),
                where("tanggal", ">=", startDate),
                where("tanggal", "<=", endDate),
                orderBy("tanggal", "desc")
            );
        } else {
            q = query(collection(db, "absensi"), orderBy("timestamp", "desc"));
        }
        
        const querySnapshot = await getDocs(q);
        const absensiList = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            absensiList.push({
                id: doc.id,
                ...data,
                // Convert timestamp to Date object
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp
            });
        });
        
        return absensiList;
    } catch (error) {
        console.error("Error getting absensi:", error);
        throw error;
    }
}

export async function getUserAbsensiHistory(userId) {
    try {
        const q = query(
            collection(db, "absensi"),
            where("userId", "==", userId),
            orderBy("timestamp", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const history = [];
        
        querySnapshot.forEach((doc) => {
            history.push(doc.data());
        });
        
        return history;
    } catch (error) {
        console.error("Error getting user history:", error);
        throw error;
    }
}

export async function checkAbsensiStatus() {
    try {
        const settings = await getAbsensiSettings();
        console.log("Settings loaded:", settings);
        
        if (!settings) {
            return { isOpen: false, message: "Absensi belum diatur" };
        }
        
        const isOpen = isAbsensiOpen(settings);
        console.log("Is absensi open?", isOpen);
        
        if (!isOpen) {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            
            if (settings.tanggal !== today) {
                return { 
                    isOpen: false, 
                    message: `Tidak ada absensi hari ini. Jadwal: ${settings.tanggal}` 
                };
            }
            
            const currentTime = now.getHours() * 60 + now.getMinutes();
            const openTime = timeToMinutes(settings.jam_buka);
            const closeTime = timeToMinutes(settings.jam_tutup);
            
            if (currentTime < openTime) {
                return { 
                    isOpen: false, 
                    message: `Absensi akan dibuka pukul ${settings.jam_buka}` 
                };
            } else {
                return { 
                    isOpen: false, 
                    message: `Absensi ditutup pukul ${settings.jam_tutup}` 
                };
            }
        }
        
        return { 
            isOpen: true, 
            message: "Absensi dibuka",
            settings: settings 
        };
    } catch (error) {
        console.error("Error checking absensi status:", error);
        return { isOpen: false, message: "Error: " + error.message };
    }
}