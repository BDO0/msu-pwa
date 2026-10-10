/**
 * Central application configuration — single source of truth.
 *
 * Everything that was previously duplicated across `app.js`, `admin.js`,
 * `firebase-ui.js` and `qr_codes.html` lives here so that changing a value
 * (e.g. the deployment URL or a station name) only has to happen once.
 *
 * NOTE ON SECRETS
 * ---------------
 * The Firebase web configuration below is NOT a secret. Firebase web API keys
 * are public identifiers by design — access control is enforced by Firestore
 * and Storage Security Rules, never by hiding these values in client code.
 * See https://firebase.google.com/docs/projects/api-keys
 */

/** Pinned Firebase JS SDK version (must match the static imports in `admin.js`). */
export const FIREBASE_SDK_VERSION = '10.9.0';

/** Firebase project credentials (see the note above about public web config). */
export const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyA1VJmRQK1bKATahlKxBiizbbS6XhB91nI',
    authDomain: 'msu-museum-pwa.firebaseapp.com',
    projectId: 'msu-museum-pwa',
    storageBucket: 'msu-museum-pwa.firebasestorage.app',
    messagingSenderId: '658642784462',
    appId: '1:658642784462:web:e08c5fa9b74e5ae9f3409f',
    measurementId: 'G-MVBB6KGDJK'
};

/** General application metadata. */
export const APP_CONFIG = {
    name: 'MSU Aga Khan Museum',
    shortName: 'AgaKhan QR',
    /**
     * Public URL where the app is deployed. Used to render the printable QR
     * codes in `qr_codes.html`. Update this one value when the app moves.
     */
    baseUrl: 'https://msu-pwa.vercel.app'
};

/**
 * Canonical museum stations. The order of this array defines the journey order
 * and the order the printable QR codes are generated in.
 *
 * @type {ReadonlyArray<{ id: string, name: string, icon: string }>}
 */
export const STATIONS = [
    { id: 'station1', name: 'Weapons & Tools', icon: '⚔️' },
    { id: 'station2', name: 'Musical Instruments', icon: '🎵' },
    { id: 'station3', name: 'Animals', icon: '🐾' }
];

/** Station ids in journey order, e.g. `['station1', 'station2', 'station3']`. */
export const STATION_IDS = STATIONS.map((station) => station.id);

/** Lookup map from station id to its display name. */
export const STATION_NAMES = STATIONS.reduce((acc, station) => {
    acc[station.id] = station.name;
    return acc;
}, {});
