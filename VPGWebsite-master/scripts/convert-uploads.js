const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];

async function convertUploadsToWebP() {
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

    console.log('🖼️  Converting all images in /uploads to WebP...\n');
    console.log(`📁 Directory: ${uploadsDir}\n`);

    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
        console.log('⚠️  Uploads directory not found. Creating it...');
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Directory created!');
        return;
    }

    // Get all files in uploads directory
    const files = fs.readdirSync(uploadsDir);

    if (files.length === 0) {
        console.log('📭 No files found in uploads directory.');
        return;
    }

    let converted = 0;
    let skipped = 0;
    let failed = 0;
    let totalSavings = 0;

    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        const ext = path.extname(file).toLowerCase();

        // Skip if not a file
        if (!fs.statSync(filePath).isFile()) {
            continue;
        }

        // Skip if already WebP
        if (ext === '.webp') {
            skipped++;
            continue;
        }

        // Skip if not an image
        if (!IMAGE_EXTENSIONS.includes(ext)) {
            skipped++;
            continue;
        }

        try {
            // Get original file size
            const originalStats = fs.statSync(filePath);
            const originalSize = originalStats.size;

            // Generate WebP filename
            const nameWithoutExt = file.replace(ext, '');
            const webpFilename = `${nameWithoutExt}.webp`;
            const webpPath = path.join(uploadsDir, webpFilename);

            // Skip if WebP version already exists
            if (fs.existsSync(webpPath)) {
                console.log(`⏭️  Skipping ${file} - WebP version already exists`);
                skipped++;
                continue;
            }

            // Convert to WebP
            await sharp(filePath)
                .webp({ quality: 85, effort: 4 })
                .toFile(webpPath);

            // Get new file size
            const newStats = fs.statSync(webpPath);
            const newSize = newStats.size;
            const savings = originalSize - newSize;
            const savingsPercent = ((1 - newSize / originalSize) * 100).toFixed(1);

            totalSavings += savings;

            console.log(`✅ ${file}`);
            console.log(`   → ${webpFilename}`);
            console.log(`   📊 ${(originalSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB (${savingsPercent}% smaller)`);

            // Optionally delete original file (commented out for safety)
            // fs.unlinkSync(filePath);
            // console.log(`   🗑️  Deleted original file`);

            console.log('');
            converted++;
        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error.message);
            failed++;
        }
    }

    console.log('\n📊 Conversion Summary:');
    console.log(`   ✅ Converted: ${converted} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    console.log(`   ❌ Failed: ${failed} files`);
    console.log(`   💾 Total savings: ${(totalSavings / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n✨ Conversion complete!');

    if (converted > 0) {
        console.log('\n💡 Note: Original files are kept for safety.');
        console.log('   You can manually delete them after verifying WebP versions work correctly.');
    }
}

convertUploadsToWebP().catch(console.error);
