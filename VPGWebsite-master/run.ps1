# VPG Website Docker Build & Deploy Script for Windows PowerShell

Write-Host "🚀 Starting VPG Website deployment..." -ForegroundColor Green

# Step 1: Stop and remove existing containers
Write-Host "📦 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Step 2: Remove old images (optional - uncomment if needed)
# docker rmi vpgwebsite-app 2>$null

# Step 3: Build and start containers
Write-Host "🔨 Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

# Step 4: Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 5: Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T app npx prisma migrate deploy

# Step 6: Generate Prisma Client
Write-Host "⚙️ Generating Prisma Client..." -ForegroundColor Yellow
docker-compose exec -T app npx prisma generate

# Step 7: Seed database (optional - comment out if not needed)
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
try {
    docker-compose exec -T app npx prisma db seed
} catch {
    Write-Host "⚠️ Seed failed or already seeded" -ForegroundColor Yellow
}

# Step 8: Check container status
Write-Host "✅ Checking container status..." -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "📍 Application is running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Admin panel: http://localhost:3000/admin/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Default credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin"
Write-Host "   Password: admin123"
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker-compose logs -f app"
Write-Host "   Stop: docker-compose down"
Write-Host "   Restart: docker-compose restart"
