const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateDatabaseUrls() {
    console.log('🔄 Updating database URLs to WebP...\n');

    try {
        // Get all car images
        const carImages = await prisma.carImage.findMany();

        if (carImages.length === 0) {
            console.log('📭 No car images found in database.');
            return;
        }

        console.log(`📊 Found ${carImages.length} images in database\n`);

        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        let updated = 0;
        let skipped = 0;
        let notFound = 0;

        for (const image of carImages) {
            const imageUrl = image.imageUrl;

            // Skip if already WebP
            if (imageUrl.endsWith('.webp')) {
                skipped++;
                continue;
            }

            // Check if it's an image URL
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
            const ext = path.extname(imageUrl).toLowerCase();

            if (!imageExtensions.includes(ext)) {
                skipped++;
                continue;
            }

            // Generate WebP URL
            const pathInfo = path.parse(imageUrl);
            const webpUrl = path.join(pathInfo.dir, `${pathInfo.name}.webp`).replace(/\\/g, '/');

            // Check if WebP file exists
            const webpFilePath = path.join(uploadsDir, path.basename(webpUrl));

            if (fs.existsSync(webpFilePath)) {
                // Update database
                await prisma.carImage.update({
                    where: { id: image.id },
                    data: { imageUrl: webpUrl }
                });

                console.log(`✅ Updated: ${imageUrl}`);
                console.log(`   → ${webpUrl}\n`);
                updated++;
            } else {
                console.log(`⚠️  WebP not found for: ${imageUrl}`);
                notFound++;
            }
        }

        console.log('\n📊 Update Summary:');
        console.log(`   ✅ Updated: ${updated} records`);
        console.log(`   ⏭️  Skipped: ${skipped} records (already WebP or not image)`);
        console.log(`   ⚠️  Not found: ${notFound} records (WebP file missing)`);
        console.log('\n✨ Database update complete!');

        if (notFound > 0) {
            console.log('\n💡 Tip: Run "npm run convert:uploads" to convert missing images.');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateDatabaseUrls().catch(console.error);
