# MSU Aga Khan Museum — Interactive QR Experience 🏛️

[![CI](https://github.com/BDO0/msu-pwa/actions/workflows/ci.yml/badge.svg)](https://github.com/BDO0/msu-pwa/actions/workflows/ci.yml)

A mobile-first **Progressive Web App (PWA)** for the **MSU Aga Khan Museum** (Mindanao State University). Visitors scan a QR code at an exhibit station, explore Maranao artifacts with audio narration, play station mini-games, unlock badges, and register on the official museum completers roster.

The project is a **no-build, framework-free static site**: plain HTML, CSS and native ES modules, with Firebase (Firestore + Auth) as an optional online backend. It works offline and is installable on mobile devices.

---

## ✨ Features

| Area | What it does |
| --- | --- |
| 📷 **QR entry point** | Scanning a station QR code deep-links straight into that station. |
| 🗺️ **Journey map** | Visual progress from the entrance through all three stations to the Hall of Masters. |
| 🏺 **Artifact discovery** | Story, description and references for every artifact, with text-to-speech narration. |
| 🎮 **Mini-games** | Station 1 rotation + naming challenge, Station 2 "Word Weaver", Station 3 "Darangen" matching game. |
| 🏆 **Badges & completion** | Per-station badges, a completion screen, and roster registration. |
| 🔐 **Admin dashboard** | `admin.html` — add / edit / delete artifacts and moderate registered completers. |
| 🖨️ **Printable QR sheet** | `qr_codes.html` — high-resolution station QR codes generated from configuration. |
| 📴 **Offline-first** | Service worker precaches the app shell; offline registrations are queued and synced automatically. |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, vanilla CSS3 (Maranao palette — maroon `#800000`, gold `#C9A84C`, green `#2E7D32`), native ES modules. No framework, no bundler, no build step.
- **Backend (optional):** Firebase Firestore + Authentication (web SDK, loaded from the CDN at runtime and version-pinned in `js/config.js`).
- **Libraries & APIs:** [`html5-qrcode`](https://github.com/mebjas/html5-qrcode) (vendored for offline use), Web Speech API, Service Worker + Web App Manifest.
- **Tooling:** Node.js built-in test runner (`node --test`), `http-server`, `localtunnel`, `sharp` (image optimisation only).

---

## 📂 Project Structure

```text
.
├── index.html
├── admin.html
├── qr_codes.html
├── manifest.json
├── sw.js
├── START_SERVER.bat
├── brand_guideline.md
├── package.json
├── .editorconfig
├── .gitattributes
├── css/
│   ├── styles.css
│   └── matchup.css
├── js/
│   ├── config.js
│   ├── utils.js
│   ├── app.js
│   ├── matchup.js
│   ├── audio.js
│   ├── firebase-ui.js
│   ├── qr-codes.js
│   ├── admin.js
│   └── html5-qrcode.min.js
├── images/
├── scripts/
│   └── compress-images.js
├── tests/
│   ├── config.test.js
│   └── utils.test.js
└── .github/workflows/ci.yml
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js ≥ 18** — needed only for the dev server, the test suite and the image script. The application itself has no build step.
- A modern browser. Camera QR scanning and service workers require a **secure context** (`https://` or `http://localhost`).
- *(Optional)* A Firebase project if you want the live Firestore / Auth features.

### Run locally

```bash
npm install
npm start
```

Then open:

| Page | URL |
| --- | --- |
| Visitor app | <http://localhost:8080/> |
| Admin dashboard | <http://localhost:8080/admin.html> |
| Printable QR sheet | <http://localhost:8080/qr_codes.html> |

**Windows shortcut:** double-click `START_SERVER.bat` to start the server and expose it through a temporary `https://` tunnel so you can test on a physical phone. Any other static server works too (VS Code *Live Server*, `python -m http.server 8080`, …).

### Run the tests

```bash
npm test
```

The suite uses the Node.js built-in test runner, so it needs **no installed dependencies**. It covers the shared helpers and asserts that the station/Firebase configuration stays internally consistent. GitHub Actions runs it on Node 20 and 22 for every push and pull request.

### Optimise images

The first command writes `.webp` siblings and keeps the originals; the second replaces the source files.

```bash
npm run images:compress
npm run images:compress -- --remove-originals
```

---

## 🔧 Configuration

Everything environment-specific lives in **`js/config.js`**:

| Export | Purpose |
| --- | --- |
| `FIREBASE_CONFIG` | Firebase web credentials (safe to commit — see note below). |
| `FIREBASE_SDK_VERSION` | Pinned Firebase JS SDK version used by every dynamic import. |
| `APP_CONFIG.baseUrl` | Public deployment URL used when generating the printable QR codes. |
| `STATIONS` / `STATION_IDS` / `STATION_NAMES` | The station list; array order defines the visitor journey. |

`STATIONS` is the single source of truth. Adding or renaming a station updates the journey map, the printable QR sheet, the admin station filter and the completion logic at once — no other file needs editing. `tests/config.test.js` guards this invariant in CI.

### Firebase

The Firebase web config is **not a secret**. Web API keys are public identifiers by design; access is controlled by **Security Rules**, never by hiding keys in client code.

The app degrades gracefully when Firebase is unreachable: `window.firebaseAPI` stays `null`, the UI renders from cached data, and nothing throws.

#### Firestore data model

| Collection | Fields |
| --- | --- |
| `artifacts` | `id`, `name`, `station`, `description`, `references`, `image`, `createdAt`, `updatedAt` |
| `completers` | `name`, `studentId`, `completionDate` |

A minimal starting point for the rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /completers/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### Local visitor state

Progress is stored on the device, never on a server:

- **localStorage** — `viewedArtifacts`, `unlockedStations`, `hasOnboarded`, `station{1,2,3}GameComplete`, `pendingRegistrations`, `hasRegistered`, `soundEnabled`.
- **sessionStorage** — `guideVoicePlayed`, `offlineNotified`, `completionCelebrated`.

Clearing site data resets a visitor's progress.

---

## 🚢 Deployment

This is a static site, so any static host works (Vercel, Netlify, GitHub Pages, Firebase Hosting).

1. Set `APP_CONFIG.baseUrl` in `js/config.js` to the final public URL.
2. Re-generate and reprint the QR sheet from `qr_codes.html`.
3. Deploy the repository root as-is — there is no build command and no output directory.
4. Bump `CACHE_NAME` in `sw.js` whenever app-shell files change, so returning visitors receive the update instead of a stale cache.

Every path in the project is relative, so the app also works from a sub-path such as `https://<user>.github.io/msu-pwa/`.

---

## 🌐 Browser Support

- **Installable PWA:** Chrome / Edge (Android and desktop), Safari on iOS 16.4+.
- **Camera scanning:** requires HTTPS — `getUserMedia` is unavailable on plain `http://` origins other than `localhost`.
- **Audio narration:** Web Speech API synthesis; the available voices depend on the operating system.

---

## 🤝 Contributing

- **Commit messages:** [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `chore:`, `test:`.
- **Formatting:** 4-space indentation in JS/CSS, 2-space in HTML/JSON/YAML, LF line endings (enforced via `.editorconfig`).
- **Tests:** any new logic in `js/config.js` or `js/utils.js` needs a matching test in `tests/`.
- Run `npm test` before opening a pull request.

---

## 👤 Admin Access

Open `admin.html`, or tap **Admin Access** in the footer of the visitor app. Sign in with an administrator account created in the Firebase console under **Authentication → Users**.

---

## 📄 License

No license has been chosen for this repository yet, so all rights are reserved by the authors. It was produced as an academic capstone project for Mindanao State University.

