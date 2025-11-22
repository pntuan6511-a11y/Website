#!/bin/bash

# VPG Website Docker Build & Deploy Script

echo "🚀 Starting VPG Website deployment..."

# Step 1: Stop and remove existing containers
echo "📦 Stopping existing containers..."
docker-compose down

# Step 2: Remove old images (optional - uncomment if needed)
# docker rmi vpgwebsite-app || true

# Step 3: Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Step 4: Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Step 5: Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Step 6: Generate Prisma Client
echo "⚙️ Generating Prisma Client..."
docker-compose exec -T app npx prisma generate

# Step 7: Seed database (optional - comment out if not needed)
echo "🌱 Seeding database..."
docker-compose exec -T app npx prisma db seed || echo "⚠️ Seed failed or already seeded"

# Step 8: Check container status
echo "✅ Checking container status..."
docker-compose ps

echo ""
echo "🎉 Deployment complete!"
echo "📍 Application is running at: http://localhost:3000"
echo "📍 Admin panel: http://localhost:3000/admin/login"
echo ""
echo "🔑 Default credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose logs -f app"
echo "   Stop: docker-compose down"
echo "   Restart: docker-compose restart"
