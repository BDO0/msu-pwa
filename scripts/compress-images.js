/**
 * Development utility: converts PNG artwork in /images to optimized WebP.
 *
 * Usage:
 *   npm run images:compress                     # convert, keep the PNG originals
 *   npm run images:compress -- --remove-originals   # delete PNGs after a successful conversion
 *
 * This script is NOT part of the build/runtime — the app ships the already
 * converted .webp files. It exists so new artwork can be optimized the same way.
 * Requires the `sharp` dev dependency (`npm install`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(projectRoot, 'images');

const MAX_WIDTH = 1000; // keep text on the artwork readable
const WEBP_QUALITY = 75;

const removeOriginals = process.argv.includes('--remove-originals');

const formatKilobytes = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function convertImages() {
    if (!fs.existsSync(imagesDir)) {
        console.error(`No images directory found at ${imagesDir}`);
        process.exitCode = 1;
        return;
    }

    const pngFiles = fs
        .readdirSync(imagesDir)
        .filter((file) => file.toLowerCase().endsWith('.png'));

    if (pngFiles.length === 0) {
        console.log('No PNG files to convert — nothing to do.');
        return;
    }

    let originalTotal = 0;
    let convertedTotal = 0;

    for (const file of pngFiles) {
        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(imagesDir, `${path.parse(file).name}.webp`);

        const originalSize = fs.statSync(inputPath).size;
        originalTotal += originalSize;

        await sharp(inputPath)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(outputPath);

        const convertedSize = fs.statSync(outputPath).size;
        convertedTotal += convertedSize;

        console.log(
            `✅ ${file} -> ${path.basename(outputPath)} ` +
                `(${formatKilobytes(originalSize)} -> ${formatKilobytes(convertedSize)})`
        );

        if (removeOriginals) {
            fs.unlinkSync(inputPath);
        }
    }

    const savedPercent = originalTotal > 0 ? ((1 - convertedTotal / originalTotal) * 100).toFixed(1) : '0.0';

    console.log('\n─────────────────────────────');
    console.log(`Files converted : ${pngFiles.length}`);
    console.log(`Original total  : ${formatKilobytes(originalTotal)}`);
    console.log(`Optimized total : ${formatKilobytes(convertedTotal)}`);
    console.log(`Saved           : ${savedPercent}%`);
    console.log('─────────────────────────────\n');
}

convertImages().catch((error) => {
    console.error('Image conversion failed:', error);
    process.exitCode = 1;
});
