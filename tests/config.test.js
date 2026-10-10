import test from 'node:test';
import assert from 'node:assert/strict';

import {
    APP_CONFIG,
    FIREBASE_CONFIG,
    FIREBASE_SDK_VERSION,
    STATIONS,
    STATION_IDS,
    STATION_NAMES
} from '../js/config.js';

test('station metadata stays internally consistent', () => {
    assert.ok(STATIONS.length > 0, 'at least one station must be configured');
    assert.equal(STATION_IDS.length, STATIONS.length);
    assert.equal(new Set(STATION_IDS).size, STATION_IDS.length, 'station ids must be unique');

    for (const station of STATIONS) {
        assert.match(station.id, /^station\d+$/, `unexpected station id: ${station.id}`);
        assert.equal(STATION_NAMES[station.id], station.name);
        assert.ok(station.name.length > 0, 'every station needs a display name');
        assert.ok(station.icon.length > 0, 'every station needs an icon');
    }
});

test('deployment base URL is a usable absolute URL without a trailing slash', () => {
    assert.ok(APP_CONFIG.baseUrl.startsWith('https://'), 'base URL must use https');
    assert.ok(!APP_CONFIG.baseUrl.endsWith('/'), 'base URL must not end with a slash');
});

test('Firebase config exposes what the SDK needs to initialise', () => {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

    for (const key of requiredKeys) {
        assert.equal(typeof FIREBASE_CONFIG[key], 'string', `${key} must be a string`);
        assert.ok(FIREBASE_CONFIG[key].length > 0, `${key} must not be empty`);
    }

    assert.match(FIREBASE_SDK_VERSION, /^\d+\.\d+\.\d+$/, 'SDK version must be semver');
});
