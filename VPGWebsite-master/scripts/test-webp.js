const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🧪 Testing WebP Upload and Serving System\n');

// Test 1: Check if uploads directory exists
console.log('📁 Test 1: Check uploads directory');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    const webpFiles = files.filter(f => f.endsWith('.webp'));
    const otherImages = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));

    console.log(`   ✅ Directory exists`);
    console.log(`   📊 Total files: ${files.length}`);
    console.log(`   🖼️  WebP files: ${webpFiles.length}`);
    console.log(`   📷 Other images: ${otherImages.length}\n`);
} else {
    console.log(`   ❌ Directory not found\n`);
}

// Test 2: Check if WebP versions exist for old images
console.log('🔍 Test 2: Check WebP conversions');
const uploadsFiles = fs.readdirSync(uploadsDir);
const imageFiles = uploadsFiles.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

let hasWebP = 0;
let missingWebP = 0;

imageFiles.forEach(file => {
    const baseName = path.parse(file).name;
    const webpFile = `${baseName}.webp`;

    if (uploadsFiles.includes(webpFile)) {
        const originalSize = fs.statSync(path.join(uploadsDir, file)).size;
        const webpSize = fs.statSync(path.join(uploadsDir, webpFile)).size;
        const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

        console.log(`   ✅ ${file} → ${webpFile} (${savings}% smaller)`);
        hasWebP++;
    } else {
        console.log(`   ⚠️  ${file} - WebP version missing`);
        missingWebP++;
    }
});

console.log(`\n   Summary: ${hasWebP} have WebP, ${missingWebP} missing\n`);

// Test 3: Test API endpoint (if server is running)
console.log('🌐 Test 3: Test API endpoint');
console.log('   ℹ️  Make sure dev server is running (npm run dev)\n');

// Pick a random image to test
const testImage = imageFiles[0];
if (testImage) {
    const testUrl = `/uploads/${testImage}`;

    console.log(`   Testing: ${testUrl}`);
    console.log(`   Expected: Should serve WebP version\n`);

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: testUrl,
        method: 'HEAD'
    };

    const req = http.request(options, (res) => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Content-Type: ${res.headers['content-type']}`);
        console.log(`   X-WebP-Fallback: ${res.headers['x-webp-fallback']}`);
        console.log(`   Cache-Control: ${res.headers['cache-control']}\n`);

        if (res.headers['content-type'] === 'image/webp') {
            console.log('   ✅ SUCCESS: Serving WebP!');
        } else {
            console.log('   ⚠️  WARNING: Not serving WebP');
        }

        if (res.headers['x-webp-fallback'] === 'true') {
            console.log('   ✅ Auto-fallback working!');
        }

        console.log('\n✨ Test complete!');
    });

    req.on('error', (e) => {
        console.log(`   ❌ Error: ${e.message}`);
        console.log('   ℹ️  Make sure dev server is running: npm run dev\n');
    });

    req.end();
} else {
    console.log('   ⚠️  No test images found\n');
}
