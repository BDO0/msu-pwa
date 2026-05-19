const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'images');
const images = ['Chapter1.png', 'Kampilan.png', 'Kris.png', 'Panolong.png', 'chapter2.png', 'chapter3.png'];

async function processImages() {
    let totalOriginalSize = 0;
    let totalNewSize = 0;

    for (const file of images) {
        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(imagesDir, file.replace('.png', '.webp'));
        
        if (fs.existsSync(inputPath)) {
            const originalStats = fs.statSync(inputPath);
            totalOriginalSize += originalStats.size;

            console.log(`Processing ${file}...`);
            await sharp(inputPath)
                .resize({ width: 1000, withoutEnlargement: true }) // slightly larger max width to preserve text readability
                .webp({ quality: 75 })
                .toFile(outputPath);
            
            const newStats = fs.statSync(outputPath);
            totalNewSize += newStats.size;

            console.log(`✅ Converted ${file} -> ${file.replace('.png', '.webp')} (${(originalStats.size / 1024 / 1024).toFixed(2)} MB -> ${(newStats.size / 1024).toFixed(2)} KB)`);
            
            // Delete original png
            fs.unlinkSync(inputPath);
        }
    }

    console.log('\n=============================');
    console.log(`Total Original Size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Compressed Size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compression Ratio: ${((1 - (totalNewSize / totalOriginalSize)) * 100).toFixed(1)}% reduction`);
    console.log('=============================\n');
}

processImages().catch(console.error);
