/**
 * MSU Aga Khan Museum — Centralized Audio Manager
 * Uses Web Audio API for synthetic, offline-capable sounds.
 * Global sound ON/OFF toggle controlled via localStorage.soundEnabled.
 */
(function () {
  let audioCtx = null;
  let _enabled = true;
  let masterGain = null;

  // Load preference
  try {
    const stored = localStorage.getItem('soundEnabled');
    _enabled = stored === null ? true : stored === 'true';
  } catch (e) {
    _enabled = true;
  }

  function isEnabled() {
    return _enabled;
  }

  function setEnabled(val) {
    _enabled = !!val;
    try { localStorage.setItem('soundEnabled', _enabled); } catch (e) { /* noop */ }
  }

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      masterGain = audioCtx.createGain();
      masterGain.gain.value = 1.8; // global volume boost
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  }

  // ─── Sound Design Functions ─────────────────────────────────────────────

  function playClick() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) { /* noop */ }
  }

  function playRotate() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) { /* noop */ }
  }

  function playCorrect() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Rising pentatonic gold chime
      const freqs = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46]; // F4,G4,A4,C5,D5,F5
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.07, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.45);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.5);
      });
    } catch (e) { /* noop */ }
  }

  function playWrong() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) { /* noop */ }
  }

  function playCelebrate() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const chord1 = [261.63, 329.63, 392.00]; // C major
      const chord2 = [293.66, 349.23, 440.00]; // F major
      const chord3 = [329.63, 415.30, 493.88, 659.25]; // E major / E5 gold chime

      const playChord = (freqs, startTime, duration) => {
        freqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.05, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.05);
        });
      };
      playChord(chord1, now, 0.35);
      playChord(chord2, now + 0.3, 0.35);
      playChord(chord3, now + 0.6, 1.1);
    } catch (e) { /* noop */ }
  }

  function playBadge() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Elegant 3-note rising arpeggio
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0.08, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.9);
      });
    } catch (e) { /* noop */ }
  }

  function playScan() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Two-tone confirmation beep + chime
      [440, 587.33].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } catch (e) { /* noop */ }
  }

  function playReveal() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Sparkle shimmer — high-frequency filtered noise
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      source.start(now);
      source.stop(now + 0.16);
    } catch (e) { /* noop */ }
  }

  function playDrag() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Soft cloth/wood rustle — very short noise burst
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / bufferSize);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.Q.setValueAtTime(0.5, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      source.start(now);
      source.stop(now + 0.07);
    } catch (e) { /* noop */ }
  }

  function playDrop() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Ceremonial gong — low sine with slow decay
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130.81, now); // C3
      osc.frequency.setValueAtTime(138.59, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) { /* noop */ }
  }

  function playStartup() {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      // Gentle, elegant gold chime — feels like entering a museum
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, i) => {
        const delay = i * 0.18;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.06, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.9);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.95);
      });
    } catch (e) { /* noop */ }
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  const soundMap = {
    click: playClick,
    rotate: playRotate,
    correct: playCorrect,
    wrong: playWrong,
    celebrate: playCelebrate,
    badge: playBadge,
    scan: playScan,
    reveal: playReveal,
    drag: playDrag,
    drop: playDrop,
    startup: playStartup
  };

  function playSound(type) {
    if (!_enabled) return;
    const fn = soundMap[type];
    if (fn) fn();
  }

  window.audioManager = { playSound, isEnabled, setEnabled };
})();