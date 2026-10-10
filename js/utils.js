/**
 * Shared, dependency-free helper functions used by the app and the mini-games.
 *
 * These are plain ES modules so they can be unit-tested with the Node.js test
 * runner (`npm test`) without a browser or a bundler.
 */

/**
 * Returns a new array containing the same elements as `items`, shuffled using
 * the Fisher–Yates algorithm. The input array is never mutated.
 *
 * @template T
 * @param {readonly T[]} items
 * @returns {T[]} a new, shuffled array
 */
export function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Returns up to `count` unique elements picked at random from `items`.
 * If `count` is larger than the input, every element is returned.
 *
 * @template T
 * @param {readonly T[]} items
 * @param {number} count
 * @returns {T[]}
 */
export function pickRandom(items, count) {
    return shuffle(items).slice(0, count);
}
