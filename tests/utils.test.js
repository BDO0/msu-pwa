import test from 'node:test';
import assert from 'node:assert/strict';

import { shuffle, pickRandom } from '../js/utils.js';

test('shuffle returns a permutation and never mutates the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const snapshot = [...input];

    const result = shuffle(input);

    assert.notStrictEqual(result, input, 'shuffle must return a new array');
    assert.deepEqual(input, snapshot, 'the input array must not be mutated');
    assert.deepEqual(
        [...result].sort((a, b) => a - b),
        [...input].sort((a, b) => a - b)
    );
});

test('shuffle handles empty and single-element arrays', () => {
    assert.deepEqual(shuffle([]), []);
    assert.deepEqual(shuffle(['only']), ['only']);
});

test('pickRandom returns the requested number of unique items', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];

    const picked = pickRandom(items, 3);

    assert.equal(picked.length, 3);
    assert.equal(new Set(picked).size, 3, 'picked items must be unique');
    picked.forEach((item) => assert.ok(items.includes(item), `${item} is not a source item`));
});

test('pickRandom never returns more items than it is given', () => {
    const items = ['x', 'y'];

    assert.deepEqual([...pickRandom(items, 10)].sort(), ['x', 'y']);
});
