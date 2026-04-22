import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc, getDocs, updateDoc, deleteDoc, query, orderBy, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

// Import config directly (We should probably export it from firebase-ui or duplicate here for simplicity,
// Since we used a CDN, I'll copy the user's config provided earlier. In a real environment, use a shared config file).
const firebaseConfig = {
  apiKey: "AIzaSyA1VJmRQK1bKATahlKxBiizbbS6XhB91nI",
  authDomain: "msu-museum-pwa.firebaseapp.com",
  projectId: "msu-museum-pwa",
  storageBucket: "msu-museum-pwa.firebasestorage.app",
  messagingSenderId: "658642784462",
  appId: "1:658642784462:web:e08c5fa9b74e5ae9f3409f",
  measurementId: "G-MVBB6KGDJK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for admin panel as well
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Persistence failed: multiple tabs open.");
    } else if (err.code == 'unimplemented') {
        console.warn("Persistence not supported by this browser.");
    }
});

let isEditing = false;
let currentDocId = null;
let currentExistingImage = null; // Store image during edit

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-form');
    const statusEl = document.getElementById('upload-status');
    const btnSubmit = document.getElementById('btn-upload');
    const formTitle = document.querySelector('.admin-header h2');
    const artifactsListBody = document.getElementById('artifacts-list-body');

    // View Switching
    const switchView = (viewId) => {
        ['view-dashboard', 'view-form', 'view-manage'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(viewId).classList.remove('hidden');
        // Always reset manage sub-steps when switching
        if (viewId !== 'view-manage') {
            document.getElementById('station-picker-step').classList.remove('hidden');
            document.getElementById('artifacts-step').classList.add('hidden');
        }
    };

    const showArtifactsForStation = (stationId, stationName) => {
        document.getElementById('station-picker-step').classList.add('hidden');
        document.getElementById('artifacts-step').classList.remove('hidden');
        document.getElementById('station-label').innerText = stationName;
        document.getElementById('artifacts-manage-title').innerText = `${stationName} Artifacts`;
        loadArtifacts(stationId);
    };

    // Station picker buttons
    document.getElementById('pick-station1').addEventListener('click', () => showArtifactsForStation('station1', 'Station 1 — Weapons & Tools'));
    document.getElementById('pick-station2').addEventListener('click', () => showArtifactsForStation('station2', 'Station 2 — Musical Instruments'));
    document.getElementById('pick-station3').addEventListener('click', () => showArtifactsForStation('station3', 'Station 3 — Cultural Attire'));

    document.getElementById('btn-back-to-station-picker').addEventListener('click', () => {
        document.getElementById('artifacts-step').classList.add('hidden');
        document.getElementById('station-picker-step').classList.remove('hidden');
    });

    document.getElementById('btn-view-add').addEventListener('click', () => {
        resetFormState();
        switchView('view-form');
    });

    document.getElementById('btn-view-edit').addEventListener('click', () => {
        document.getElementById('manage-title').innerText = "Choose a Station";
        document.getElementById('manage-subtitle').innerText = "Select which station's artifacts you want to edit.";
        switchView('view-manage');
    });

    document.getElementById('btn-view-delete').addEventListener('click', () => {
        document.getElementById('manage-title').innerText = "Choose a Station";
        document.getElementById('manage-subtitle').innerText = "Select which station's artifacts you want to delete.";
        switchView('view-manage');
    });

    document.getElementById('btn-back-to-dash-form').addEventListener('click', () => switchView('view-dashboard'));
    document.getElementById('btn-back-to-dash-manage').addEventListener('click', () => switchView('view-dashboard'));

    // --- Image Compression Utility ---
    const compressImage = async (file, { quality = 0.7, maxWidth = 800, maxHeight = 800 }) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Return the Base64 data URL directly
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    };

    // --- Core Functions ---

    const loadArtifacts = async (stationFilter = null) => {
        try {
            const q = query(collection(db, "artifacts"));
            const querySnapshot = await getDocs(q);
            
            artifactsListBody.innerHTML = '';
            
            if (querySnapshot.empty) {
                artifactsListBody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px;">No artifacts found.</td></tr>';
                return;
            }

            let artifactsArray = [];
            querySnapshot.forEach((document) => {
                artifactsArray.push({ id: document.id, data: document.data() });
            });

            // Filter by station if provided
            if (stationFilter) {
                artifactsArray = artifactsArray.filter(item => item.data.station === stationFilter);
            }

            if (artifactsArray.length === 0) {
                artifactsListBody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px;">No artifacts in this station yet.</td></tr>';
                return;
            }

            // Sort by createdAt descending
            artifactsArray.sort((a, b) => {
                const dateA = a.data.createdAt ? new Date(a.data.createdAt).getTime() : 0;
                const dateB = b.data.createdAt ? new Date(b.data.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            artifactsArray.forEach((item) => {
                const data = item.data;
                const docId = item.id;
                
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #eee";
                tr.innerHTML = `
                    <td style="padding: 10px;"><strong>${data.name || 'Unnamed'}</strong></td>
                    <td style="padding: 10px;">
                        <button class="btn-edit" data-id="${docId}" style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:5px; margin-right:5px; cursor:pointer;">Edit</button>
                        <button class="btn-delete" data-id="${docId}" style="background:#dc3545; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">Delete</button>
                    </td>
                `;
                artifactsListBody.appendChild(tr);
            });


            // Attach events to buttons
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', () => handleEdit(btn.getAttribute('data-id'), artifactsArray));
            });
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', () => handleDelete(btn.getAttribute('data-id')));
            });

        } catch (error) {
            console.error("Error loading artifacts:", error);
            artifactsListBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px; color:red;">Failed to load data. Error: ${error.message}</td></tr>`;
        }
    };

    const handleEdit = (docId, artifactsArray) => {
        const item = artifactsArray.find(d => d.id === docId);
        if (!item) return;
        const data = item.data;

        // Populate Form
        document.getElementById('art-id').value = data.id;
        document.getElementById('art-name').value = data.name;
        document.getElementById('art-station').value = data.station;
        document.getElementById('art-desc').value = data.description;
        document.getElementById('art-refs').value = data.references === "N/A" ? "" : data.references;
        
        // Don't populate data URL in the view - it's too large and ugly
        if (data.image && !data.image.startsWith('data:image')) {
            document.getElementById('art-url').value = data.image;
        } else {
            document.getElementById('art-url').value = '';
        }

        // Change UI state
        isEditing = true;
        currentDocId = docId;
        currentExistingImage = data.image || null; // Save existing image
        btnSubmit.innerText = "Save Changes";
        document.getElementById('form-title').innerText = "Edit Artifact";
        switchView('view-form');
    };

    const handleDelete = async (docId) => {
        if (!confirm("Are you sure you want to permanently delete this artifact?")) return;
        try {
            await deleteDoc(doc(db, "artifacts", docId));
            alert("Artifact deleted successfully.");
            loadArtifacts();
        } catch (error) {
            alert("Error deleting artifact: " + error.message);
        }
    };

    const resetFormState = () => {
        form.reset();
        isEditing = false;
        currentDocId = null;
        currentExistingImage = null;
        btnSubmit.innerText = "Upload Artifact";
        document.getElementById('form-title').innerText = "Upload New Artifact";
        statusEl.classList.add('hidden');
    };

    // --- Form Submission ---

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        btnSubmit.disabled = true;
        statusEl.className = 'status-loading';
        statusEl.innerText = isEditing ? 'Saving Changes...' : 'Data Uploading & Syncing...';
        statusEl.classList.remove('hidden');

        try {
            const artId = document.getElementById('art-id').value;
            const name = document.getElementById('art-name').value;
            const station = document.getElementById('art-station').value;
            const description = document.getElementById('art-desc').value;
            const refs = document.getElementById('art-refs').value;
            const imageFile = document.getElementById('art-image').files[0];
            const imageUrlField = document.getElementById('art-url').value;

            let downloadUrl = imageUrlField || (isEditing ? currentExistingImage : null);

            // 1. Image Upload Logic (Base64 directly to Firestore)
            if (imageFile) {
                statusEl.innerText = 'Compressing Image...';
                // Compress and convert directly to a Base64 string
                downloadUrl = await compressImage(imageFile, { quality: 0.7, maxWidth: 800, maxHeight: 800 });
                statusEl.innerText = isEditing ? 'Saving Changes...' : 'Uploading Data...';
            }

            if (!downloadUrl) throw new Error("Please provide an image file or an external image URL.");

            // 2. Data Preparation
            const artifactData = {
                id: artId,
                name: name,
                station: station,
                description: description,
                references: refs || "N/A",
                image: downloadUrl,
                updatedAt: new Date().toISOString()
            };

            if (!isEditing) {
                artifactData.createdAt = new Date().toISOString();
                await addDoc(collection(db, "artifacts"), artifactData);
            } else {
                await updateDoc(doc(db, "artifacts", currentDocId), artifactData);
            }

            alert(isEditing ? 'Changes Saved Successfully!' : 'Upload Successful!');
            
            resetFormState();
            loadArtifacts();
            switchView('view-dashboard');

        } catch (error) {
            console.error("Admin error:", error);
            statusEl.className = 'status-error';
            statusEl.innerText = `Error: ${error.message}`;
            btnSubmit.disabled = false;
        } finally {
            btnSubmit.disabled = false;
        }
    });

    // Initial Load
    loadArtifacts();
});
