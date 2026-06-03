import { initStationChallenge, initWordWeaver, initDarangenGame } from './matchup.js';

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
let html5QrcodeScanner = null; // Global reference to the scanner

async function cacheImages(artifacts) {
    try {
        if (!('caches' in window)) return;
        const CACHE_NAME = 'msu-museum-images';
        const cache = await caches.open(CACHE_NAME);

        // Filter out URLs that are empty OR are actually Base64 strings ('data:')
        const imageUrls = artifacts
            .map(a => a.image)
            .filter(url => url && !url.startsWith('data:'));

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
        console.log("Network-hosted images cached completely!");
        showOfflineReadyNotification();
    } catch (e) {
        console.error("Image cache error:", e);
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
    const stationMap = {};
    let allArtifacts = [];
    
    // 1. Fetching from Firebase (Admin Panel source of truth)
    if (window.firebaseAPI) {
        try {
            const firebaseArtifacts = await window.firebaseAPI.getAllArtifacts();
            
            // If it returns an array (even empty), we are connected to Firebase
            if (firebaseArtifacts !== null) {
                console.log("Firebase Connection Active. Artifacts found:", firebaseArtifacts.length);
                allArtifacts = firebaseArtifacts;
                
                // Initialize default station structure
                stationMap['station1'] = { id: 'station1', name: 'Weapons & Tools', artifacts: [] };
                stationMap['station2'] = { id: 'station2', name: 'Musical Instruments', artifacts: [] };
                stationMap['station3'] = { id: 'station3', name: 'Animals', artifacts: [] };
                
                firebaseArtifacts.forEach(art => {
                    const st = art.station || 'station1';
                    if (stationMap[st]) stationMap[st].artifacts.push(art);
                });
            }
        } catch (e) {
            console.warn("Firebase fetch failed, falling back to local JSON.", e);
        }
    }

    // 2. Fallback to Local JSON files if no artifacts were fetched (either offline or empty database)
    if (allArtifacts.length === 0) {
        try {
            console.log("Firebase unreachable. Loading data from local JSON fallback.");
            const [res1, res2, res3] = await Promise.all([
                fetch('./data/station1.json'),
                fetch('./data/station2.json'),
                fetch('./data/station3.json')
            ]);
            
            if (res1.ok) {
                const data1 = await res1.json();
                stationMap[data1.id] = data1;
                allArtifacts = allArtifacts.concat(data1.artifacts);
            }
            if (res2.ok) {
                const data2 = await res2.json();
                stationMap[data2.id] = data2;
                allArtifacts = allArtifacts.concat(data2.artifacts);
            }
            if (res3.ok) {
                const data3 = await res3.json();
                stationMap[data3.id] = data3;
                allArtifacts = allArtifacts.concat(data3.artifacts);
            }
        } catch (e) {
            console.error("Error loading local JSON data:", e);
        }
    }

    if (allArtifacts.length > 0) {
        // Run image caching logic to ensure external images are cached
        await cacheImages(allArtifacts);

        // Sanitize viewed artifacts: remove any IDs that were deleted
        const validIds = allArtifacts.map(a => a.id);
        const validViewed = state.viewedArtifacts.filter(id => validIds.includes(id));
        if (validViewed.length !== state.viewedArtifacts.length) {
            state.viewedArtifacts = validViewed;
            localStorage.setItem('viewedArtifacts', JSON.stringify(state.viewedArtifacts));
        }
    } else {
        console.warn("No artifacts found in local JSON files.");
    }

    state.stationsData = stationMap;
    for (const st in stationMap) {
        if(stationMap[st].artifacts) {
            state.totalArtifacts += stationMap[st].artifacts.length;
        }
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
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    
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

        if (artifactId === 'game') {
            renderGame(stationId);
        } else if (artifactId) {
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
    
    // Update Visitor Title
    let title = "Curious Visitor";
    if (progressPct >= 100) {
        title = "Master Historian 👑";
    } else if (progressPct >= 66) {
        title = "Maranao Scholar 🎓";
    } else if (progressPct >= 33) {
        title = "Cultural Explorer 🧭";
    }
    const visitorTitleEl = template.getElementById('visitor-title');
    if (visitorTitleEl) visitorTitleEl.innerText = title;
    
    // Check completion
    const completionMessage = template.getElementById('completion-message');
    if (state.isCompleted) {
        completionMessage.classList.remove('hidden');
        if (localStorage.getItem('hasRegistered') === 'true') {
            const btnReg = template.getElementById('btn-register');
            if (btnReg) {
                btnReg.style.display = 'none';
                const msg = document.createElement('p');
                msg.innerText = "✅ You are officially registered as a completer!";
                msg.style.color = 'var(--gold)';
                msg.style.fontWeight = 'bold';
                msg.style.marginTop = '15px';
                completionMessage.appendChild(msg);
            }
        }
    } else {
        completionMessage.classList.add('hidden');
    }
    
    // Update Badges
    if (localStorage.getItem('station1GameComplete') === 'true') {
        const b1 = template.getElementById('badge-station1');
        if (b1) b1.classList.remove('locked');
    }
    if (localStorage.getItem('station2GameComplete') === 'true') {
        const b2 = template.getElementById('badge-station2');
        if (b2) b2.classList.remove('locked');
    }
    if (localStorage.getItem('station3GameComplete') === 'true') {
        const b3 = template.getElementById('badge-station3');
        if (b3) b3.classList.remove('locked');
    }
    
    // Dynamic Hero Text
    const heroWelcomeText = template.getElementById('hero-welcome-text');
    if (heroWelcomeText) {
        if (state.totalArtifacts > 0 && progressPct >= 100) {
            heroWelcomeText.innerText = "Congratulations on completing the tour! Have you registered your name yet?";
        } else if (state.viewedArtifacts.length > 0) {
            const left = state.totalArtifacts - state.viewedArtifacts.length;
            heroWelcomeText.innerText = `Welcome back! You have ${left} more artifact${left > 1 ? 's' : ''} left to discover.`;
        } else {
            heroWelcomeText.innerText = "Your cultural journey begins here. Tap 'Scan Station QR' at your first stop.";
        }
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
    } else {
        completersList.innerHTML = '<li>Connect to internet to view official completers</li>';
    }

    // Modal Registration Logic
    const btnRegister = template.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            document.getElementById('register-modal').classList.remove('hidden');
        });
    }
    
    // Scanner Logic
    const btnScanQr = template.getElementById('btn-scan-qr');
    const btnStartExploring = template.getElementById('btn-start-exploring');
    if (btnScanQr) {
        if (state.unlockedStations.length >= STATIONS.length) {
            btnScanQr.style.display = 'none';
            if (btnStartExploring) {
                btnStartExploring.style.display = 'inline-block';
                btnStartExploring.innerText = 'Continue Exploring';
            }
        } else {
            btnScanQr.addEventListener('click', () => {
                openScannerModal();
            });
        }
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
                    <a href="#/station1/game" class="btn btn-secondary" style="display:inline-block; margin-top:10px;">Play Station Challenge</a>
                </div>
            `;
        } else if (stationId === 'station2') {
            gameSection.innerHTML = `
                <div class="station-challenge-card">
                    <h2>🪘 Maranao Word Weaver</h2>
                    <p>Spell the names of 3 mystery artifacts! Letters scramble — only the sharpest minds prevail.</p>
                    <a href="#/station2/game" class="btn btn-secondary" style="display:inline-block; margin-top:10px;">Play Word Weaver</a>
                </div>
            `;
        } else if (stationId === 'station3') {
            gameSection.innerHTML = `
                <div class="station-challenge-card" style="border-color: var(--gold); box-shadow: 0 4px 15px rgba(201,168,76,0.2);">
                    <h2 style="color: var(--gold);">✨ Darangen Quest</h2>
                    <p>Experience the epic tale. Match the sacred artifacts to their chapters in the Maranao Darangen.</p>
                    <a href="#/station3/game" class="btn btn-secondary" style="background:var(--gold); color:var(--surface); display:inline-block; margin-top:10px;">Play Darangen Quest</a>
                </div>
            `;
        }
    }
}

async function renderGame(stationId) {
    const template = document.getElementById('tmpl-game').content.cloneNode(true);
    const data = getStationData(stationId);
    
    if (!data) {
        appContent.innerHTML = '<h2>Station not found</h2><a href="#/">Back Home</a>';
        return;
    }
    
    template.getElementById('back-to-station-from-game').href = `#/${stationId}`;
    
    const gameTitle = template.getElementById('game-title');
    const gameSubtitle = template.getElementById('game-subtitle');
    
    appContent.appendChild(template);
    
    const containerId = 'game-container';
    
    if (stationId === 'station1') {
        gameTitle.innerText = "🏆 Station Challenge";
        gameSubtitle.innerText = "Test your knowledge! Solve 5 image puzzles and identify the artifacts.";
        initStationChallenge(containerId, data.artifacts, () => {
            console.log('Station 1 Challenge completed!');
        });
    } else if (stationId === 'station2') {
        gameTitle.innerText = "🪘 Maranao Word Weaver";
        gameSubtitle.innerText = "Spell the names of 3 mystery artifacts! Letters scramble.";
        initWordWeaver(containerId, data.artifacts, () => {
            console.log('Station 2 Word Weaver completed!');
        });
    } else if (stationId === 'station3') {
        gameTitle.innerText = "✨ Darangen Quest";
        gameSubtitle.innerText = "Experience the epic tale. Match the sacred artifacts to their chapters.";
        
        // Pass all global artifacts to Darangen Game so it can use Station 1 and 2 artifacts as baits
        let globalArtifacts = [];
        for (const st in state.stationsData) {
            if (state.stationsData[st] && state.stationsData[st].artifacts) {
                globalArtifacts = globalArtifacts.concat(state.stationsData[st].artifacts);
            }
        }
        
        initDarangenGame(containerId, globalArtifacts, () => {
            console.log('Station 3 Darangen Game completed!');
        });
    } else {
        gameTitle.innerText = "Coming Soon";
        gameSubtitle.innerText = "There is no challenge available for this station yet.";
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
    
    // Setup Audio Guide
    const btnListen = template.getElementById('btn-listen');
    if (btnListen && window.speechSynthesis) {
        let isPlaying = false;
        btnListen.addEventListener('click', () => {
            if (isPlaying) {
                window.speechSynthesis.cancel();
                btnListen.innerHTML = '🔊 Listen';
                isPlaying = false;
            } else {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(`${art.name}. ${art.description}`);
                utterance.onend = () => {
                    btnListen.innerHTML = '🔊 Listen';
                    isPlaying = false;
                };
                window.speechSynthesis.speak(utterance);
                btnListen.innerHTML = '⏸ Stop Audio';
                isPlaying = true;
            }
        });
    } else if (btnListen) {
        btnListen.style.display = 'none';
    }
    
    appContent.appendChild(template);
}

function openScannerModal() {
    let modal = document.getElementById('scanner-modal');
    
    // Inject the scanner modal if it hasn't been added yet
    if (!modal) {
        const modalTemplate = document.getElementById('tmpl-scanner-modal').content.cloneNode(true);
        const overlay = modalTemplate.querySelector('.modal-overlay');
        overlay.classList.remove('hidden'); // Ensure it's visible when added
        document.body.appendChild(modalTemplate);
        
        modal = document.getElementById('scanner-modal');
        const btnClose = document.getElementById('btn-close-scanner');
        const btnStop = document.getElementById('btn-stop-scanner');
        
        const closeScanner = () => {
            modal.classList.add('hidden');
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(err => console.error("Failed to clear scanner", err));
                html5QrcodeScanner = null;
            }
        };
        
        btnClose.addEventListener('click', closeScanner);
        btnStop.addEventListener('click', closeScanner);
    } else {
        modal.classList.remove('hidden');
    }
    
    // Initialize scanner
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", 
            { 
                fps: 10, 
                qrbox: {width: 250, height: 250},
                supportedScanTypes: [0] // 0 = Html5QrcodeScanType.SCAN_TYPE_CAMERA
            }, 
            false
        );
        
        html5QrcodeScanner.render((decodedText) => {
            console.log(`Scan result: ${decodedText}`);
            
            // Look for a station ID in the QR code text
            let match = decodedText.match(/(station[1-3])/i);
            if (match) {
                window.location.hash = `#/${match[1].toLowerCase()}`;
                modal.classList.add('hidden');
                html5QrcodeScanner.clear().catch(e => console.error(e));
                html5QrcodeScanner = null;
            } else {
                alert("Unrecognized QR Code. Please scan a valid Station QR Code.");
            }
        }, (errorMessage) => {
            // Ignore normal scanning errors
        });
    }
}

// --- Onboarding Logic ---
function handleOnboarding() {
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    const splashScreen = document.getElementById('splash-screen');
    
    if (!hasOnboarded) {
        splashScreen.classList.remove('hidden');
        
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            showOnboardingModal();
        }, 2500);
    }
}

function showOnboardingModal() {
    const modalTemplate = document.getElementById('tmpl-onboarding-modal').content.cloneNode(true);
    document.body.appendChild(modalTemplate);
    
    const modal = document.getElementById('onboarding-modal');
    const btnNext = document.getElementById('btn-onboard-next');
    const dots = modal.querySelectorAll('.onboard-dot');
    let currentSlide = 0;
    
    btnNext.addEventListener('click', () => {
        document.getElementById(`onboard-slide-${currentSlide}`).classList.add('hidden');
        dots[currentSlide].classList.remove('active');
        dots[currentSlide].style.background = 'rgba(201,168,76,0.3)';
        
        currentSlide++;
        
        if (currentSlide < 3) {
            document.getElementById(`onboard-slide-${currentSlide}`).classList.remove('hidden');
            dots[currentSlide].classList.add('active');
            dots[currentSlide].style.background = 'var(--gold)';
            
            if (currentSlide === 2) {
                btnNext.innerText = "Get Started";
            }
        } else {
            modal.remove();
            localStorage.setItem('hasOnboarded', 'true');
        }
    });
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
                localStorage.setItem('hasRegistered', 'true');
                
                successMsg.innerText = "You are offline. Registration saved and will sync automatically!";
                successMsg.classList.remove('hidden');
                form.reset();
                setTimeout(() => { 
                    modal.classList.add('hidden'); 
                    successMsg.classList.add('hidden'); 
                    if (window.location.hash === '#/') router();
                }, 3000);
                
                btnSubmit.disabled = false;
                return;
            }
            
            if (window.firebaseAPI) {
                const res = await window.firebaseAPI.registerCompleter(name, studentId);
                if (res.success) {
                    localStorage.setItem('hasRegistered', 'true');
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

    // Setup Admin Login Modal Events
    if (!document.getElementById('admin-login-modal')) {
        const adminModalTemplate = document.getElementById('tmpl-admin-login-modal').content.cloneNode(true);
        const adminOverlay = adminModalTemplate.querySelector('.modal-overlay');
        adminOverlay.classList.add('hidden');
        document.body.appendChild(adminModalTemplate);

        const adminModal = document.getElementById('admin-login-modal');
        const adminBtnClose = document.getElementById('btn-close-admin-login');
        const adminForm = document.getElementById('admin-login-form');
        const adminErrorMsg = document.getElementById('admin-login-error');
        const adminBtnSubmit = document.getElementById('btn-admin-login-submit');

        adminBtnClose.addEventListener('click', () => {
            adminModal.classList.add('hidden');
        });

        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-login-email').value;
            const pass = document.getElementById('admin-login-pass').value;

            adminBtnSubmit.disabled = true;
            adminErrorMsg.classList.add('hidden');

            if (window.firebaseAPI && window.firebaseAPI.adminLogin) {
                const res = await window.firebaseAPI.adminLogin(email, pass);
                if (res.success) {
                    window.location.href = "admin.html";
                } else {
                    adminErrorMsg.innerText = res.error || "Login failed";
                    adminErrorMsg.classList.remove('hidden');
                    adminBtnSubmit.disabled = false;
                }
            } else {
                adminErrorMsg.innerText = "Firebase API not available";
                adminErrorMsg.classList.remove('hidden');
                adminBtnSubmit.disabled = false;
            }
        });
    }

    // Attach click event for the footer link
    const adminLoginLink = document.getElementById('admin-login-link');
    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            const adminModal = document.getElementById('admin-login-modal');
            if (adminModal) {
                adminModal.classList.remove('hidden');
            }
        });
    }
}

// App Initialization
async function init() {
    // Register Service Worker first so it can start caching immediately
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('ServiceWorker registered, scope:', registration.scope);
        } catch (err) {
            console.warn('ServiceWorker registration failed:', err);
        }
    }

    handleOnboarding();
    syncRegistrations(); // Attempt sync on load if online

    // Wait for firebase-ui.js to finish its async setup (success OR failure).
    // It dispatches 'firebaseReady' in both cases via the finally block.
    await new Promise(resolve => {
        // If firebase-ui.js already finished before we got here, resolve immediately
        if (window.firebaseAPI !== undefined) return resolve();
        // Otherwise wait for the event (max 5 seconds as a safety net)
        const timeout = setTimeout(resolve, 5000);
        window.addEventListener('firebaseReady', () => {
            clearTimeout(timeout);
            resolve();
        }, { once: true });
    });

    await initData();
    router();
}

// Start
init();

