@echo off
REM VPG Website Docker Build & Deploy Script for Windows

echo 🚀 Starting VPG Website deployment...

REM Step 1: Stop and remove existing containers
echo 📦 Stopping existing containers...
docker-compose down

REM Step 2: Build and start containers
echo 🔨 Building and starting containers...
docker-compose up -d --build

REM Step 3: Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Step 4: Run database migrations
echo 🗄️ Running database migrations...
docker-compose exec -T app npx prisma migrate deploy

REM Step 5: Generate Prisma Client
echo ⚙️ Generating Prisma Client...
docker-compose exec -T app npx prisma generate

REM Step 6: Seed database
echo 🌱 Seeding database...
docker-compose exec -T app npx prisma db seed

REM Step 7: Check container status
echo ✅ Checking container status...
docker-compose ps

echo.
echo 🎉 Deployment complete!
echo 📍 Application is running at: http://localhost:3000
echo 📍 Admin panel: http://localhost:3000/admin/login
echo.
echo 🔑 Default credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo 📋 Useful commands:
echo    View logs: docker-compose logs -f app
echo    Stop: docker-compose down
echo    Restart: docker-compose restart

pause
