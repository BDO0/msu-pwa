// Firebase is loaded dynamically so the app works offline even if the CDN is unreachable.
// If Firebase cannot be loaded (e.g. user is offline on first visit), window.firebaseAPI
// is set to null and the app degrades gracefully to whatever is already cached locally.

import { FIREBASE_CONFIG, FIREBASE_SDK_VERSION } from './config.js';

const FIREBASE_CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;

// Self-invoking async function so we can use await without blocking the module
(async () => {
    try {
        // Dynamic imports — if CDN is offline, this throws and we catch it gracefully
        const { initializeApp } = await import(`${FIREBASE_CDN}/firebase-app.js`);
        const { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, enableIndexedDbPersistence } = await import(`${FIREBASE_CDN}/firebase-firestore.js`);
        const { getAuth, signInWithEmailAndPassword } = await import(`${FIREBASE_CDN}/firebase-auth.js`);

        const app = initializeApp(FIREBASE_CONFIG);
        const db = getFirestore(app);
        const auth = getAuth(app);

        // Enable offline persistence for Firestore (cached reads when offline)
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn("Persistence failed: multiple tabs open.");
            } else if (err.code == 'unimplemented') {
                console.warn("Persistence not supported by this browser.");
            }
        });

        // Attach functions to window so app.js can use them
        window.firebaseAPI = {
            adminLogin: async (email, password) => {
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            },

            registerCompleter: async (name, studentId) => {
                try {
                    const q = query(collection(db, "completers"), where("studentId", "==", studentId));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        return { success: false, error: "Student ID already registered." };
                    }
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

    } catch (error) {
        // Firebase CDN is unreachable (e.g. user is offline on first visit)
        // Set firebaseAPI to null so app.js knows to fall back to local JSON
        console.warn("Firebase could not be loaded (offline or CDN unreachable). Running in offline mode.", error.message);
        window.firebaseAPI = null;
    } finally {
        // Always fire this event so app.js knows Firebase setup is done (success or failure)
        window.dispatchEvent(new CustomEvent('firebaseReady'));
    }
})();
