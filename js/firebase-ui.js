// Firebase Configuration Placeholder
// REPLACE these with your actual Firebase project settings.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1VJmRQK1bKATahlKxBiizbbS6XhB91nI",
  authDomain: "msu-museum-pwa.firebaseapp.com",
  projectId: "msu-museum-pwa",
  storageBucket: "msu-museum-pwa.firebasestorage.app",
  messagingSenderId: "658642784462",
  appId: "1:658642784462:web:e08c5fa9b74e5ae9f3409f",
  measurementId: "G-MVBB6KGDJK"
};

let app, db;
let isFirebaseInitialized = false;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn("Persistence failed: multiple tabs open.");
        } else if (err.code == 'unimplemented') {
            console.warn("Persistence not supported by this browser.");
        }
    });

    // If we reach here with actual credentials, it worked.
    // Since these are placeholders, it might throw later during DB access, which we'll handle gracefully.
    isFirebaseInitialized = true;
} catch (error) {
    console.warn("Firebase failed to initialize. Check your config keys.", error);
}

// Attach functions to window so app.js can use them
window.firebaseAPI = {
    registerCompleter: async (name, studentId) => {
        if (!isFirebaseInitialized || firebaseConfig.apiKey === "YOUR_API_KEY") {
            // Mock success if offline or using placeholder
            console.log("Mock Registration:", { name, studentId });
            return { success: true, mock: true };
        }
        
        try {
            // Check for duplicate student ID
            const q = query(collection(db, "completers"), where("studentId", "==", studentId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { success: false, error: "Student ID already registered." };
            }

            // Save doc
            await addDoc(collection(db, "completers"), {
                name: name,
                studentId: studentId,
                completionDate: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error("Error registering:", error);
            return { success: false, error: error.message };
        }
    },
    
    getCompleters: async () => {
        if (!isFirebaseInitialized || firebaseConfig.apiKey === "YOUR_API_KEY") {
            // Mock data
            return [
                { name: "Abdulsalam Abdulgani", completionDate: new Date().toISOString() },
                { name: "Mohammad Farhan Dipatuan", completionDate: new Date(Date.now() - 86400000).toISOString() }
            ];
        }

        try {
            const q = query(collection(db, "completers"), orderBy("completionDate", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            let completers = [];
            querySnapshot.forEach((doc) => {
                completers.push(doc.data());
            });
            return completers;
        } catch (error) {
            console.error("Error fetching completers:", error);
            return null;
        }
    },
    
    getAllArtifacts: async () => {
        if (!isFirebaseInitialized || firebaseConfig.apiKey === "YOUR_API_KEY") {
            return null;
        }
        try {
            const q = query(collection(db, "artifacts"));
            const querySnapshot = await getDocs(q);
            let artifacts = [];
            querySnapshot.forEach((doc) => {
                artifacts.push(doc.data());
            });
            return artifacts;
        } catch (error) {
            console.error("Error fetching artifacts:", error);
            return null;
        }
    }
};
