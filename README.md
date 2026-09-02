MSU Aga Khan Museum — Interactive QR Code System

Project Overview
The MSU Aga Khan Museum Interactive QR Code System is a mobile-first Progressive Web Application (PWA) designed to transform museum visits into an interactive, digital cultural journey. Visitors scan QR codes placed at different exhibit stations using their phone camera to unlock Maranao cultural artifacts, listen to audio narration, play station mini-games, earn badges, and register on the Official Completers Roster.

 Key Features

1. Progressive Web Application (PWA): Mobile-first, fast-loading, installable, and capable of offline use (`sw.js`).
2. In-App Camera QR Scanner: Powered by `html5-qrcode` to scan station codes directly inside the browser.
3. Interactive Journey Map: Tracks progress as visitors travel through Entrance → Station 1 → Station 2 → Station 3 → Hall of Masters.
4. Artifact Discovery & Audio Narration: Highlighting traditional Maranao heritage (Sarimanok, Okir patterns, Langkit fabrics, etc.) with text-to-speech support (`audio.js`).
5. Station Mini-Games:
   * Station 1: Cultural Exploration Quiz
   * Station 2: Word Weaver Challenge
   * Station 3: Darangen Matching Game
6. Achievements & Official Completer Registration: Visitor progress tracking with badge unlocks and student registration upon 100% completion.
7. Admin Dashboard (`admin.html`): Allows museum staff to log in via Firebase to add, edit, or delete artifacts and manage completers.
8. Printable QR Code Page (`qr_codes.html`): High-resolution QR codes ready to print and post at exhibit stations.

Tech Stack
  Frontend: HTML5, Custom Vanilla CSS3 (Maranao Cultural Palette: Maroon `#800000`, Gold `#C9A84C`, Green `#2E7D32`), JavaScript (ES Modules).
  Backend & Database: Firebase Firestore Database, Storage, and Authentication.
  APIs & Libraries: `html5-qrcode`, Web Speech Audio Synthesis API, PWA Service Worker.

Project Structure

c:/Abdo/Capstone/
├── index.html            # Main visitor PWA interface (Single Page App)
├── admin.html            # Admin dashboard to manage artifacts & completers
├── qr_codes.html         # Printable QR codes page for exhibit stations
├── brand_guideline.md    # UI/UX design rules and color palette specs
├── manifest.json         # PWA Manifest configuration
├── sw.js                 # Service Worker for offline support
├── START_SERVER.bat      # Windows batch launcher (local server + tunnel)
├── README.md             # Project documentation file (Now Created)
├── css/                  # Global styles & game layout stylesheets
├── js/                   # App routing, admin logic, Firebase UI, mini-games & QR scanner
├── data/                 # Station JSON datasets
├── images/               # Media and artifact images
└── Documentation/        # Capstone research papers & chapter docs

How to Run & Test
  Windows Quick Launcher: Double-click `START_SERVER.bat` to launch a local server (`http://localhost:8080`) and open an HTTPS tunnel for mobile testing.
  Web Server: Open the project folder using any web server (such as VS Code *Live Server* or `npx http-server`) and navigate to `index.html`.
