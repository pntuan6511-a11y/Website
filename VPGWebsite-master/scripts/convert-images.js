const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Images to convert
const imagesToConvert = [
    {
        input: 'public/default/dai-ly.jpg',
        output: 'public/default/dai-ly.webp'
    },
    {
        input: 'public/default/vinfastlogo.jpg',
        output: 'public/default/vinfastlogo.webp'
    },
    {
        input: 'public/default/vinfastlogo.png',
        output: 'public/default/vinfastlogo-png.webp'
    }
];

async function convertToWebP() {
    console.log('🖼️  Converting images to WebP format...\n');

    for (const image of imagesToConvert) {
        const inputPath = path.join(__dirname, '..', image.input);
        const outputPath = path.join(__dirname, '..', image.output);

        // Check if input file exists
        if (!fs.existsSync(inputPath)) {
            console.log(`⚠️  Skipping ${image.input} - file not found`);
            continue;
        }

        try {
            // Get original file size
            const originalStats = fs.statSync(inputPath);
            const originalSize = (originalStats.size / 1024).toFixed(2);

            // Convert to WebP
            await sharp(inputPath)
                .webp({ quality: 85 }) // 85% quality for good balance
                .toFile(outputPath);

            // Get new file size
            const newStats = fs.statSync(outputPath);
            const newSize = (newStats.size / 1024).toFixed(2);
            const savings = ((1 - newStats.size / originalStats.size) * 100).toFixed(1);

            console.log(`✅ ${image.input}`);
            console.log(`   → ${image.output}`);
            console.log(`   📊 ${originalSize} KB → ${newSize} KB (${savings}% smaller)\n`);
        } catch (error) {
            console.error(`❌ Error converting ${image.input}:`, error.message);
        }
    }

    console.log('✨ Image conversion complete!');
}

convertToWebP().catch(console.error);
