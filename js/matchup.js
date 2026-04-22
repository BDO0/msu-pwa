/**
 * MSU Museum Station Challenge — Game 1 (Station 1)
 * 5-round multi-phase: Rotation Puzzle → Name Identification
 */

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickRandom(arr, n) {
    return shuffle(arr).slice(0, n);
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────

/**
 * @param {string} containerId  - ID of the DOM element to render into
 * @param {Array}  allArtifacts - Full list of artifacts for the station
 * @param {function} onComplete - Called when all 5 rounds are finished
 */
export function initStationChallenge(containerId, allArtifacts, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!allArtifacts || allArtifacts.length < 4) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">Not enough artifacts in this station to start the challenge.</p>';
        return;
    }

    // Pick 5 random artifacts for this session
    const TOTAL_ROUNDS = Math.min(5, allArtifacts.length);
    const roundArtifacts = pickRandom(allArtifacts, TOTAL_ROUNDS);

    let currentRound = 0;

    // ── Round Runner ─────────────────────────────────────────────────────────
    function runRound() {
        if (currentRound >= TOTAL_ROUNDS) {
            showVictory(container, onComplete);
            return;
        }

        const artifact = roundArtifacts[currentRound];
        container.innerHTML = '';
        container.classList.add('game-phase-enter');

        // Round indicator + dots
        const topBar = document.createElement('div');
        topBar.innerHTML = `
            <div class="round-indicator">ROUND ${currentRound + 1} / ${TOTAL_ROUNDS}</div>
            <div class="round-dots">
                ${roundArtifacts.map((_, i) => `
                    <div class="round-dot ${i < currentRound ? 'done' : i === currentRound ? 'active' : ''}"></div>
                `).join('')}
            </div>
        `;
        container.appendChild(topBar);

        // Phase A: Rotation puzzle
        runRotationPhase(container, artifact, allArtifacts, () => {
            // Phase B: Name identification
            runNamePhase(container, artifact, allArtifacts,
                () => { // onCorrect
                    currentRound++;
                    setTimeout(() => runRound(), 600);
                },
                () => { // onGameOver
                    showGameOver(container, () => initStationChallenge(containerId, allArtifacts, onComplete));
                }
            );
        });
    }

    runRound();
}

// ─── Phase A: Rotation Puzzle ─────────────────────────────────────────────────

function runRotationPhase(container, artifact, allArtifacts, onSolved) {
    const wrapper = document.createElement('div');
    wrapper.className = 'matchup-wrapper';

    const instructions = document.createElement('p');
    instructions.className = 'matchup-instructions';
    instructions.innerText = '🧩 Rotate the tiles to reveal the artifact!';
    wrapper.appendChild(instructions);

    const grid = document.createElement('div');
    grid.className = 'matchup-grid';

    let tiles = [];
    const imageUrl = artifact.image || '';

    for (let i = 0; i < 9; i++) {
        const tile = document.createElement('div');
        tile.className = 'matchup-tile';
        tile.style.backgroundImage = `url('${imageUrl}')`;
        const row = Math.floor(i / 3);
        const col = i % 3;
        tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
        tile.style.backgroundSize = '300px 300px';

        // Randomise rotation (1–3 = wrong, 0 = correct)
        let state = Math.floor(Math.random() * 3) + 1;
        tile.dataset.state = state;
        tile.dataset.rotation = state * 90;
        tile.style.transform = `rotate(${state * 90}deg)`;

        tile.addEventListener('click', () => {
            let s = parseInt(tile.dataset.state);
            s = (s + 1) % 4;
            tile.dataset.state = s;
            let r = parseInt(tile.dataset.rotation) + 90;
            tile.dataset.rotation = r;
            tile.style.transform = `rotate(${r}deg)`;

            if (s === 0) {
                tile.classList.add('correct');
            } else {
                tile.classList.remove('correct');
            }

            if (tiles.every(t => parseInt(t.dataset.state) === 0)) {
                // Lock all tiles
                tiles.forEach(t => { t.style.pointerEvents = 'none'; });
                // Brief flash then proceed
                setTimeout(() => {
                    gridPop(grid);
                    setTimeout(onSolved, 500);
                }, 400);
            }
        });

        tiles.push(tile);
        grid.appendChild(tile);
    }

    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

function gridPop(grid) {
    grid.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    grid.style.transform = 'scale(1.03)';
    grid.style.boxShadow = '0 0 40px rgba(201, 168, 76, 0.6)';
    setTimeout(() => {
        grid.style.transform = 'scale(1)';
        grid.style.boxShadow = '';
    }, 300);
}

// ─── Phase B: Name Identification ─────────────────────────────────────────────

function runNamePhase(container, artifact, allArtifacts, onCorrect, onGameOver) {
    // Remove rotation wrapper, keep top bar
    const previousWrapper = container.querySelector('.matchup-wrapper');
    if (previousWrapper) previousWrapper.remove();

    let lives = 3;

    const nameWrap = document.createElement('div');
    nameWrap.className = 'name-challenge-wrapper game-phase-enter';

    // Show the solved image (small)
    const img = document.createElement('img');
    img.src = artifact.image || '';
    img.alt = 'Solved artifact';
    img.style.cssText = 'width:100px; height:100px; object-fit:cover; border-radius:8px; border:2px solid var(--gold); margin-bottom:16px; box-shadow:0 0 20px rgba(201,168,76,0.3);';
    nameWrap.appendChild(img);

    const title = document.createElement('h3');
    title.innerText = '🏺 What is the name of this artifact?';
    nameWrap.appendChild(title);

    // Lives display
    const livesEl = document.createElement('div');
    livesEl.className = 'lives-display';
    const renderLives = () => {
        livesEl.innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
    };
    renderLives();
    nameWrap.appendChild(livesEl);

    // Build 4 choices: 1 correct + 3 random decoys
    const decoys = pickRandom(
        allArtifacts.filter(a => a.id !== artifact.id),
        3
    );
    const choices = shuffle([artifact, ...decoys]);

    const grid = document.createElement('div');
    grid.className = 'choice-grid';

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `
            <span class="okir-tr"></span>
            <span class="okir-bl"></span>
            <span>${choice.name}</span>
        `;

        btn.addEventListener('click', () => {
            if (choice.id === artifact.id) {
                // ✅ Correct
                btn.classList.add('correct-answer');
                grid.querySelectorAll('.choice-btn').forEach(b => b.style.pointerEvents = 'none');
                saveGameWin(artifact.id);
                setTimeout(onCorrect, 900);
            } else {
                // ❌ Wrong — only shake this button, never reveal the answer
                lives--;
                renderLives();
                btn.classList.add('wrong-answer');
                btn.style.pointerEvents = 'none'; // disable just this wrong button

                setTimeout(() => {
                    btn.classList.remove('wrong-answer');
                }, 600);

                if (lives <= 0) {
                    // Game Over
                    grid.querySelectorAll('.choice-btn').forEach(b => b.style.pointerEvents = 'none');
                    setTimeout(() => onGameOver(), 700);
                }
            }
        });

        grid.appendChild(btn);
    });

    nameWrap.appendChild(grid);
    container.appendChild(nameWrap);
}


// ─── Game Over Screen ─────────────────────────────────────────────────────────

function showGameOver(container, onReplay) {
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'victory-screen game-phase-enter';
    screen.innerHTML = `
        <div class="trophy" style="filter:grayscale(1);">💀</div>
        <h2 style="color:#FF7070;">Game Over!</h2>
        <p>You ran out of lives. Better luck next time!</p>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
            <button id="btn-replay" class="btn btn-secondary" style="width:auto; padding:12px 28px;">🔄 Play Again</button>
            <a href="#/station1" class="btn btn-game" style="width:auto; padding:12px 28px;">← Back to Station</a>
        </div>
    `;
    container.appendChild(screen);
    document.getElementById('btn-replay').addEventListener('click', onReplay);
}

// ─── Victory Screen ───────────────────────────────────────────────────────────

function showVictory(container, onComplete) {
    container.innerHTML = '';

    const screen = document.createElement('div');
    screen.className = 'victory-screen game-phase-enter';
    screen.innerHTML = `
        <div class="trophy">🏆</div>
        <h2>Challenge Complete!</h2>
        <p>You successfully identified all 5 artifacts in this Station Challenge!</p>
        <p style="color:var(--gold); font-weight:600; margin-top:8px;">✨ Badge Progress Saved</p>
    `;

    container.appendChild(screen);

    if (onComplete) onComplete();
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function saveGameWin(artifactId) {
    let gamesWon = JSON.parse(localStorage.getItem('gamesWon') || '[]');
    if (!gamesWon.includes(artifactId)) {
        gamesWon.push(artifactId);
        localStorage.setItem('gamesWon', JSON.stringify(gamesWon));
    }
    if (gamesWon.length >= 9) {
        localStorage.setItem('hasSpecialBadge', 'true');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARANAO WORD WEAVER — Station 2 Game
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @param {string} containerId    - ID of the DOM element to render into
 * @param {Array}  allArtifacts  - Full list of Station 2 artifacts
 * @param {function} onComplete  - Called when all 3 rounds are won
 */
export function initWordWeaver(containerId, allArtifacts, onComplete) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!allArtifacts || allArtifacts.length < 1) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">No artifacts available for this game yet.</p>';
        return;
    }

    const TOTAL_ROUNDS = Math.min(3, allArtifacts.length);
    const roundArtifacts = pickRandom(allArtifacts, TOTAL_ROUNDS);
    let currentRound = 0;

    function runWWRound() {
        if (currentRound >= TOTAL_ROUNDS) {
            showWWVictory(container, onComplete);
            return;
        }
        const artifact = roundArtifacts[currentRound];
        container.innerHTML = '';
        container.classList.add('game-phase-enter');
        renderWordWeaverRound(container, artifact, allArtifacts, TOTAL_ROUNDS, currentRound, () => {
            currentRound++;
            setTimeout(runWWRound, 800);
        }, () => {
            // Game over for Word Weaver
            showWWGameOver(container, () => initWordWeaver(containerId, allArtifacts, onComplete));
        });
    }

    runWWRound();
}

// ─── Word Weaver Round ────────────────────────────────────────────────────────

function renderWordWeaverRound(container, artifact, allArtifacts, totalRounds, roundIndex, onRoundWin, onGameOver) {
    // Normalize: uppercase, keep letters and spaces only for display
    const rawName = artifact.name.toUpperCase();
    // Characters to guess: only letters, track positions
    const chars = rawName.split(''); // e.g. ['K','R','I','S',' ','S','W','O','R','D']

    // Extract unique letters only (excluding spaces)
    const letterChars = chars.filter(c => c !== ' ');

    // Generate decoy letters — random uppercase letters NOT in the answer
    const answerLetterSet = new Set(letterChars);
    const allAlpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const available = allAlpha.split('').filter(c => !answerLetterSet.has(c));
    const decoyCount = Math.min(5, available.length);
    const decoys = pickRandom(available, decoyCount);

    // Build the letter pool: correct letters + decoys, shuffled
    const pool = shuffle([...letterChars, ...decoys]);

    // Track state
    let lives = 3;
    let filledSlots = []; // { slotIndex, letter, tileIndex } — only for letter slots (not spaces)
    const letterSlotIndices = chars.reduce((acc, c, i) => { if (c !== ' ') acc.push(i); return acc; }, []);

    // ── Build UI ──────────────────────────────────────────────────────────────

    const wrapper = document.createElement('div');
    wrapper.className = 'word-weaver-wrapper';

    // Round info
    const roundInfo = document.createElement('div');
    roundInfo.className = 'ww-round-info';
    roundInfo.innerHTML = `ROUND ${roundIndex + 1} / ${totalRounds}
        <div class="round-dots" style="margin-top:6px;">
            ${Array.from({length: totalRounds}, (_, i) =>
                `<div class="round-dot ${i < roundIndex ? 'done' : i === roundIndex ? 'active' : ''}"></div>`
            ).join('')}
        </div>`;
    wrapper.appendChild(roundInfo);

    // Image with blur
    const maxBlur = letterChars.length * 1.5;
    const imgHeader = document.createElement('div');
    imgHeader.className = 'ww-image-header';
    const artifactImg = document.createElement('img');
    artifactImg.src = artifact.image || '';
    artifactImg.className = 'ww-artifact-img';
    artifactImg.style.filter = `blur(${Math.min(maxBlur, 15)}px)`;
    const imgLabel = document.createElement('div');
    imgLabel.className = 'ww-image-label';
    imgLabel.innerText = 'Reveal the artifact by spelling its name!';
    imgHeader.appendChild(artifactImg);
    imgHeader.appendChild(imgLabel);
    wrapper.appendChild(imgHeader);

    // Prompt + lives
    const prompt = document.createElement('div');
    prompt.className = 'ww-prompt';
    prompt.innerText = '✍️ Spell the artifact name!';
    wrapper.appendChild(prompt);

    const livesEl = document.createElement('div');
    livesEl.className = 'lives-display';
    const renderLives = () => { livesEl.innerHTML = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives); };
    renderLives();
    wrapper.appendChild(livesEl);

    // Answer slots
    const answerRow = document.createElement('div');
    answerRow.className = 'ww-answer-row';
    const slotEls = chars.map((c, i) => {
        const slot = document.createElement('div');
        if (c === ' ') {
            slot.className = 'ww-slot space-slot';
            slot.textContent = '';
            slot.dataset.isSpace = 'true';
        } else {
            slot.className = 'ww-slot';
            slot.dataset.slotIndex = i;
        }
        answerRow.appendChild(slot);
        return slot;
    });
    wrapper.appendChild(answerRow);

    // Letter pool
    const poolEl = document.createElement('div');
    poolEl.className = 'ww-pool';

    const tileEls = pool.map((letter, tileIdx) => {
        const tile = document.createElement('div');
        tile.className = 'ww-tile';
        tile.textContent = letter;
        tile.dataset.letter = letter;
        tile.dataset.tileIdx = tileIdx;
        tile.addEventListener('click', () => onTileClick(tileIdx, letter, tile));
        poolEl.appendChild(tile);
        return tile;
    });
    wrapper.appendChild(poolEl);

    container.appendChild(wrapper);

    // ── Slot click = undo ─────────────────────────────────────────────────────
    slotEls.forEach((slot, slotPos) => {
        if (slot.dataset.isSpace) return;
        slot.addEventListener('click', () => {
            const fillIdx = filledSlots.findIndex(f => f.slotIndex === slotPos);
            if (fillIdx === -1) return; // empty slot — ignore
            const fill = filledSlots[fillIdx];

            // Un-fill the slot
            slot.textContent = '';
            slot.classList.remove('filled', 'solved');
            filledSlots.splice(fillIdx, 1);

            // Un-mark solved state if it was there
            checkSolvedSlots();

            // Return tile to pool
            tileEls[fill.tileIndex].classList.remove('used');

            // Adjust blur back
            updateBlur();
        });
    });

    // ── Tile click = fill first empty letter slot ─────────────────────────────
    function onTileClick(tileIdx, letter, tile) {
        if (tile.classList.contains('used')) return;

        // Find the next unfilled letter slot (left to right)
        const nextEmpty = letterSlotIndices.find(si => !filledSlots.some(f => f.slotIndex === si));
        if (nextEmpty === undefined) return; // all filled

        // Check if this letter is correct for this position
        const expectedLetter = chars[nextEmpty];

        if (letter === expectedLetter) {
            // Correct letter for this slot
            tile.classList.add('used');
            slotEls[nextEmpty].textContent = letter;
            slotEls[nextEmpty].classList.add('filled');
            filledSlots.push({ slotIndex: nextEmpty, letter, tileIndex: tileIdx });

            checkSolvedSlots();
            updateBlur();

            // Check win
            if (filledSlots.length === letterSlotIndices.length) {
                // All slots filled correctly — win!
                lockAll();
                setTimeout(() => {
                    artifactImg.style.filter = 'blur(0px)';
                    imgLabel.innerText = artifact.name;
                    showSolvedBanner(wrapper, artifact.name, onRoundWin);
                    saveGameWin(artifact.id);
                }, 400);
            }
        } else if (!answerLetterSet.has(letter)) {
            // Decoy letter — shake and return
            tile.classList.add('decoy-shake');
            setTimeout(() => tile.classList.remove('decoy-shake'), 450);

            lives--;
            renderLives();
            if (lives <= 0) {
                lockAll();
                setTimeout(() => onGameOver(), 700);
            }
        } else {
            // Letter is in the word but wrong position — shake (wrong order)
            tile.classList.add('decoy-shake');
            setTimeout(() => tile.classList.remove('decoy-shake'), 450);

            lives--;
            renderLives();
            if (lives <= 0) {
                lockAll();
                setTimeout(() => onGameOver(), 700);
            }
        }
    }

    function checkSolvedSlots() {
        // Mark solved on all currently filled, correct slots
        slotEls.forEach((slot, i) => {
            if (slot.dataset.isSpace) return;
            const fill = filledSlots.find(f => f.slotIndex === i);
            if (fill) {
                slot.classList.add('solved');
            } else {
                slot.classList.remove('solved');
            }
        });
    }

    function updateBlur() {
        const correct = filledSlots.length;
        const total = letterSlotIndices.length;
        const blurPx = Math.max(0, maxBlur - (correct / total) * maxBlur);
        artifactImg.style.filter = `blur(${blurPx.toFixed(1)}px)`;
    }

    function lockAll() {
        tileEls.forEach(t => { t.style.pointerEvents = 'none'; });
        slotEls.forEach(s => { s.style.pointerEvents = 'none'; });
    }
}

function showSolvedBanner(wrapper, name, onNext) {
    const banner = document.createElement('div');
    banner.className = 'ww-solved-banner';
    banner.innerHTML = `✅ Correct! <strong>${name}</strong> — Well done!`;
    wrapper.appendChild(banner);
    setTimeout(onNext, 1800);
}

// ─── Word Weaver Victory ──────────────────────────────────────────────────────

function showWWVictory(container, onComplete) {
    container.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'victory-screen game-phase-enter';
    screen.innerHTML = `
        <div class="trophy">🏆</div>
        <h2>Word Weaver Complete!</h2>
        <p>You spelled all 3 artifact names correctly! You are a true Maranao scholar.</p>
        <p style="color:var(--gold); font-weight:600; margin-top:8px;">✨ Badge Progress Saved</p>
    `;
    container.appendChild(screen);
    if (onComplete) onComplete();
}

function showWWGameOver(container, onReplay) {
    container.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'victory-screen game-phase-enter';
    screen.innerHTML = `
        <div class="trophy" style="filter:grayscale(1);">💀</div>
        <h2 style="color:#FF7070;">Game Over!</h2>
        <p>You ran out of lives while spelling. Try again!</p>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
            <button id="btn-ww-replay" class="btn btn-secondary" style="width:auto; padding:12px 28px;">🔄 Play Again</button>
            <a href="#/station2" class="btn btn-game" style="width:auto; padding:12px 28px;">← Back to Station</a>
        </div>
    `;
    container.appendChild(screen);
    document.getElementById('btn-ww-replay').addEventListener('click', onReplay);
}

