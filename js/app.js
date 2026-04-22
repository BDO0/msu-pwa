import { initStationChallenge, initWordWeaver } from './matchup.js';

// State management
let state = {
    stationsData: {}, // { "station1": { id, name, artifacts: [] }, ... }
    totalArtifacts: 0,
    viewedArtifacts: JSON.parse(localStorage.getItem('viewedArtifacts') || '[]'),
    unlockedStations: JSON.parse(localStorage.getItem('unlockedStations') || '[]'),
    isCompleted: false
};

const STATIONS = ['station1', 'station2', 'station3'];
const appContent = document.getElementById('app-content');

// Cache Warmer Logic
async function cacheWarmer(artifacts) {
    try {
        if (!('caches' in window)) return;
        const CACHE_NAME = 'msu-museum-cache-v1';
        const cache = await caches.open(CACHE_NAME);
        
        // 1. Cache the JSON data
        const jsonResponse = new Response(JSON.stringify(artifacts), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/api/cached-artifacts.json', jsonResponse);
        console.log("JSON data cached for offline use");

        // 2. Pre-fetch and cache image URLs
        const imageUrls = artifacts.map(a => a.image).filter(url => url);
        for (const url of imageUrls) {
            const cachedUrl = await cache.match(url);
            if (!cachedUrl) {
                try {
                    const response = await fetch(url, { mode: 'cors' });
                    if (response.ok) {
                        await cache.put(url, response.clone());
                    }
                } catch (e) {
                    console.warn("Could not cache image:", url);
                }
            }
        }
        console.log("Firebase Storage images cached completely!");
        showOfflineReadyNotification();
    } catch (e) {
        console.error("Cache warmer error:", e);
    }
}

// Background Sync Logic
async function syncRegistrations() {
    if (!navigator.onLine || !window.firebaseAPI) return;
    let pendingRegs = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
    if (pendingRegs.length === 0) return;
    
    let remaining = [];
    for (let reg of pendingRegs) {
        const res = await window.firebaseAPI.registerCompleter(reg.name, reg.studentId);
        if (!res.success && res.error !== "Student ID already registered.") {
            remaining.push(reg); // Keep it if there was a real error (e.g. still offline)
        }
    }
    localStorage.setItem('pendingRegistrations', JSON.stringify(remaining));
}

// Global Online Listener for Sync
window.addEventListener('online', syncRegistrations);

function showOfflineReadyNotification() {
    if (sessionStorage.getItem('offlineNotified')) return;
    
    const toast = document.createElement('div');
    toast.className = 'offline-toast';
    toast.innerHTML = '✨ <strong>Ready for Offline Use</strong><br>All museum data is saved to your device.';
    
    toast.style.cssText = "position:fixed; bottom:-100px; left:50%; transform:translateX(-50%); background:#800000; color:#FFD700; padding:15px 25px; border-radius:30px; box-shadow:0 10px 20px rgba(0,0,0,0.2); z-index:9999; text-align:center; transition:bottom 0.5s ease; font-family: 'Poppins', sans-serif;";
    
    document.body.appendChild(toast);
    
    // Slide up
    setTimeout(() => { toast.style.bottom = "20px"; }, 100);
    // Slide down and remove
    setTimeout(() => { 
        toast.style.bottom = "-100px"; 
        setTimeout(() => toast.remove(), 500); 
    }, 4000);
    
    sessionStorage.setItem('offlineNotified', 'true');
}

// Helper to get station data from state (we strictly use Firestore data now)
function getStationData(stationId) {
    return state.stationsData[stationId] || null;
}

// Load all data on init to know total artifacts
async function initData() {
    state.totalArtifacts = 0;
    let firebaseArtifacts = null;
    
    // Check Firebase for artifacts
    if (window.firebaseAPI) {
        firebaseArtifacts = await window.firebaseAPI.getAllArtifacts();
    }

    // Try offline cache fallback if firebase failed
    if (!firebaseArtifacts || firebaseArtifacts.length === 0) {
        try {
            const cachedRes = await fetch('/api/cached-artifacts.json');
            if (cachedRes.ok) firebaseArtifacts = await cachedRes.json();
        } catch (e) {}
    }

    // Group artifacts by station for app state compatibility
    const stationMap = {
        'station1': { id: 'station1', name: 'Weapons & Tools', artifacts: [] },
        'station2': { id: 'station2', name: 'Musical Instruments', artifacts: [] },
        'station3': { id: 'station3', name: 'Cultural Attire', artifacts: [] }
    };

    if (firebaseArtifacts && firebaseArtifacts.length > 0) {
        // Run cache warmer logic
        await cacheWarmer(firebaseArtifacts);

        // Sanitize viewed artifacts: remove any IDs that were deleted by admin
        const validIds = firebaseArtifacts.map(a => a.id);
        const validViewed = state.viewedArtifacts.filter(id => validIds.includes(id));
        if (validViewed.length !== state.viewedArtifacts.length) {
            state.viewedArtifacts = validViewed;
            localStorage.setItem('viewedArtifacts', JSON.stringify(state.viewedArtifacts));
        }

        firebaseArtifacts.forEach(art => {
             // Fallback default if unassigned
            const st = art.station || 'station1';
            if (stationMap[st]) stationMap[st].artifacts.push(art);
        });
    } else {
        console.warn("No artifacts found via Firebase or Cache.");
    }

    state.stationsData = stationMap;
    for (const st in stationMap) {
        state.totalArtifacts += stationMap[st].artifacts.length;
    }
    
    checkCompletion();
}

// Mark artifact as viewed
function markViewed(artifactId) {
    if (!state.viewedArtifacts.includes(artifactId)) {
        state.viewedArtifacts.push(artifactId);
        localStorage.setItem('viewedArtifacts', JSON.stringify(state.viewedArtifacts));
        checkCompletion();
    }
}

// Check completion logic
function checkCompletion() {
    if (state.totalArtifacts > 0 && state.viewedArtifacts.length >= state.totalArtifacts) {
        state.isCompleted = true;
    } else {
        state.isCompleted = false;
    }
}

// Navigation & Routing
function router() {
    const hash = window.location.hash || '#/';
    appContent.innerHTML = ''; // Clear current view
    
    if (hash === '#/') {
        renderHome();
    } else if (hash.startsWith('#/station')) {
        const parts = hash.split('/');
        const stationId = parts[1];
        const artifactId = parts[2];
        
        // Unlock station if accessed directly via URL (QR code scan)
        if (!state.unlockedStations.includes(stationId)) {
            state.unlockedStations.push(stationId);
            localStorage.setItem('unlockedStations', JSON.stringify(state.unlockedStations));
        }

        if (artifactId) {
            renderArtifact(stationId, artifactId);
        } else {
            renderStation(stationId);
        }
    } else {
        renderHome();
    }
}

window.addEventListener('hashchange', router);

// --- Render Functions ---

async function renderHome() {
    const template = document.getElementById('tmpl-home').content.cloneNode(true);
    
    // Overall Progress
    const progressText = template.getElementById('overall-progress-text');
    const progressFill = template.getElementById('overall-progress-fill');
    
    progressText.innerText = `You have viewed ${state.viewedArtifacts.length} out of ${state.totalArtifacts} artifacts`;
    const progressPct = state.totalArtifacts === 0 ? 0 : Math.round((state.viewedArtifacts.length / state.totalArtifacts) * 100);
    progressFill.style.width = `${progressPct}%`;
    
    // Check completion
    const completionMessage = template.getElementById('completion-message');
    if (state.isCompleted) {
        completionMessage.classList.remove('hidden');
    } else {
        completionMessage.classList.add('hidden');
    }
    
    // Station List
    const stationListEl = template.getElementById('home-station-list');
    for (const st of STATIONS) {
        const stData = getStationData(st);
        if (stData) {
            const li = document.createElement('li');
            const isUnlocked = state.unlockedStations.includes(st);
            
            if (isUnlocked) {
                li.innerHTML = `<a href="#/${st}" class="station-item unlocked"><span class="station-icon">🔓</span> <span class="station-name">${stData.name}</span></a>`;
            } else {
                li.innerHTML = `<a href="#" class="station-item locked" onclick="alert('Scan the Station QR code to unlock this location!'); return false;"><span class="station-icon">🔒</span> <span class="station-name">${stData.name}</span></a>`;
            }
            stationListEl.appendChild(li);
        }
    }
    
    // Completers
    const completersList = template.getElementById('completers-list');
    if (window.firebaseAPI) {
        window.firebaseAPI.getCompleters().then(completers => {
            completersList.innerHTML = '';
            if (completers && completers.length > 0) {
                completers.forEach(c => {
                    const li = document.createElement('li');
                    const d = new Date(c.completionDate).toLocaleDateString();
                    li.innerHTML = `<span>${c.name}</span> <span class="completer-date">${d}</span>`;
                    completersList.appendChild(li);
                });
            } else if (completers === null) {
                completersList.innerHTML = '<li>Connect to internet to view official completers</li>';
            } else {
                completersList.innerHTML = '<li>No completers yet. Be the first!</li>';
            }
        });
    }

    // Modal Registration Logic
    const btnRegister = template.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            document.getElementById('register-modal').classList.remove('hidden');
        });
    }
    
    appContent.appendChild(template);
    
    // Handle offline install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('btn-install');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.addEventListener('click', () => {
                installBtn.classList.add('hidden');
                deferredPrompt.prompt();
            });
        }
    });

    // Setup global modal after render
    setupModal();
}

async function renderStation(stationId) {
    const template = document.getElementById('tmpl-station').content.cloneNode(true);
    const data = getStationData(stationId);
    
    if (!data) {
        appContent.innerHTML = '<h2>Station not found</h2><a href="#/">Back Home</a>';
        return;
    }
    
    template.getElementById('station-title').innerText = data.name;
    
    let stationViewed = 0;
    const artifactsGrid = template.getElementById('station-artifacts-list');
    
    data.artifacts.forEach(art => {
        const isViewed = state.viewedArtifacts.includes(art.id);
        if (isViewed) stationViewed++;
        
        const a = document.createElement('a');
        a.href = `#/${stationId}/${art.id}`;
        a.className = 'artifact-card';
        a.innerHTML = `
            <img src="${art.image}" alt="${art.name}">
            <div class="artifact-card-info">
                <div class="artifact-card-title">${art.name}</div>
                <div class="viewed-indicator ${isViewed ? 'viewed' : ''}">${isViewed ? '✓ Viewed' : 'Not Viewed'}</div>
            </div>
        `;
        artifactsGrid.appendChild(a);
    });
    
    // Progress for this station
    const progressText = template.getElementById('station-progress-text');
    const progressFill = template.getElementById('station-progress-fill');
    
    progressText.innerText = `You have viewed ${stationViewed} out of ${data.artifacts.length} artifacts in this station`;
    const progressPct = data.artifacts.length === 0 ? 0 : Math.round((stationViewed / data.artifacts.length) * 100);
    progressFill.style.width = `${progressPct}%`;
    
    appContent.appendChild(template);

    // Render Station Game Section
    const gameSection = appContent.querySelector('#station-game-section');
    if (gameSection) {
        if (stationId === 'station1') {
            gameSection.innerHTML = `
                <div class="station-challenge-card">
                    <h2>🏆 Station Challenge</h2>
                    <p>Test your knowledge! Solve 5 image puzzles and identify the artifacts from this station.</p>
                    <button id="btn-start-challenge" class="btn btn-secondary">Start Station Challenge</button>
                    <div id="challenge-container" style="margin-top:20px;"></div>
                </div>
            `;
            document.getElementById('btn-start-challenge').addEventListener('click', () => {
                document.getElementById('btn-start-challenge').style.display = 'none';
                initStationChallenge('challenge-container', data.artifacts, () => {
                    console.log('Station 1 Challenge completed!');
                });
            });
        } else if (stationId === 'station2') {
            gameSection.innerHTML = `
                <div class="station-challenge-card">
                    <h2>🪘 Maranao Word Weaver</h2>
                    <p>Spell the names of 3 mystery artifacts! Letters scramble — only the sharpest minds prevail.</p>
                    <button id="btn-start-challenge" class="btn btn-secondary">Start Word Weaver</button>
                    <div id="challenge-container" style="margin-top:20px;"></div>
                </div>
            `;
            document.getElementById('btn-start-challenge').addEventListener('click', () => {
                document.getElementById('btn-start-challenge').style.display = 'none';
                initWordWeaver('challenge-container', data.artifacts, () => {
                    console.log('Station 2 Word Weaver completed!');
                });
            });
        } else {
            gameSection.innerHTML = `
                <div class="station-challenge-card">
                    <h2>🎮 Station Challenge</h2>
                    <p>A challenge for this station is coming soon.</p>
                    <span class="coming-soon-badge">COMING SOON</span>
                </div>
            `;
        }
    }
}


async function renderArtifact(stationId, artifactId) {
    const template = document.getElementById('tmpl-artifact').content.cloneNode(true);
    const data = getStationData(stationId);
    
    if (!data) {
        appContent.innerHTML = '<h2>Artifact not found</h2><a href="#/">Back Home</a>';
        return;
    }
    
    const art = data.artifacts.find(a => a.id === artifactId);
    if (!art) {
        appContent.innerHTML = '<h2>Artifact not found</h2><a href="#/">Back Home</a>';
        return;
    }
    
    // Mark viewed immediately
    markViewed(artifactId);
    
    // Populate details
    template.getElementById('back-to-station').href = `#/${stationId}`;
    template.getElementById('artifact-img').src = art.image;
    template.getElementById('artifact-title').innerText = art.name;
    template.getElementById('artifact-desc').innerText = art.description;
    template.getElementById('artifact-refs').innerText = art.references;
    
    template.getElementById('artifact-viewed-badge').classList.remove('hidden');
    
    appContent.appendChild(template);
}

function setupModal() {
    // If modal template hasn't been appended to body yet, append it once
    if (!document.getElementById('register-modal')) {
        const modalTemplate = document.getElementById('tmpl-register-modal').content.cloneNode(true);
        // Initially hide the modal
        const overlay = modalTemplate.querySelector('.modal-overlay');
        overlay.classList.add('hidden');
        document.body.appendChild(modalTemplate);
        
        // Setup events
        const modal = document.getElementById('register-modal');
        const btnClose = document.getElementById('btn-close-modal');
        const form = document.getElementById('register-form');
        const errorMsg = document.getElementById('reg-error');
        const successMsg = document.getElementById('reg-success');
        const btnSubmit = document.getElementById('btn-submit-reg');
        
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const studentId = document.getElementById('reg-id').value;
            
            btnSubmit.disabled = true;
            errorMsg.classList.add('hidden');
            successMsg.classList.add('hidden');
            
            // Name Validation (Letters and spaces only)
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!nameRegex.test(name)) {
                errorMsg.innerText = "Name can only contain letters and spaces.";
                errorMsg.classList.remove('hidden');
                btnSubmit.disabled = false;
                return;
            }

            // Background Sync Check
            if (!navigator.onLine) {
                let pendingRegs = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
                pendingRegs.push({ name, studentId });
                localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRegs));
                
                successMsg.innerText = "You are offline. Registration saved and will sync automatically!";
                successMsg.classList.remove('hidden');
                form.reset();
                setTimeout(() => { modal.classList.add('hidden'); successMsg.classList.add('hidden'); }, 3000);
                
                btnSubmit.disabled = false;
                return;
            }
            
            if (window.firebaseAPI) {
                const res = await window.firebaseAPI.registerCompleter(name, studentId);
                if (res.success) {
                    successMsg.classList.remove('hidden');
                    form.reset();
                    // Auto close after 2 seconds
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        successMsg.classList.add('hidden');
                        // Refresh home view to show new completer
                        if (window.location.hash === '#/') router();
                    }, 2000);
                } else {
                    errorMsg.innerText = res.error || "An error occurred";
                    errorMsg.classList.remove('hidden');
                }
            }
            btnSubmit.disabled = false;
        });
    }
}

// App Initialization
async function init() {
    syncRegistrations(); // Attempt sync on load if online
    await initData();
    router();
    
    // Register Service Worker for PWA offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

// Start
init();
