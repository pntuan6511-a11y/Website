# 🚀 Hướng Dẫn Deploy Code Mới Lên VPS

## 📋 Tổng quan

Deploy code mới lên VPS đã có database và data, bao gồm tất cả optimizations đã implement.

## ⚠️ Quan trọng trước khi deploy

### 1. Backup trước khi deploy

```bash
# Trên VPS - Backup database
pg_dump -U postgres dbname > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup code hiện tại
cd /path/to/app
tar -czf backup_code_$(date +%Y%m%d_%H%M%S).tar.gz .

# Backup uploads
tar -czf backup_uploads_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/
```

## 🔄 Quy trình Deploy

### Bước 1: Chuẩn bị code trên local

```bash
# 1. Đảm bảo code đã commit
git add .
git commit -m "Performance optimizations: WebP, caching, VPS optimization"

# 2. Push lên repository (nếu dùng Git)
git push origin main

# 3. Hoặc tạo archive để copy
tar -czf deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

### Bước 2: Copy code lên VPS

**Cách 1: Dùng Git (Khuyến nghị)**
```bash
# Trên VPS
cd /path/to/app
git pull origin main
```

**Cách 2: Dùng SCP**
```bash
# Từ local
scp deploy.tar.gz user@your-vps-ip:/path/to/app/

# Trên VPS
cd /path/to/app
tar -xzf deploy.tar.gz
```

**Cách 3: Dùng FTP/SFTP**
- Upload toàn bộ code (trừ `node_modules`, `.next`)

### Bước 3: Cài đặt dependencies

```bash
# Trên VPS
cd /path/to/app

# Cài đặt dependencies
npm ci --production=false

# Hoặc nếu có lỗi
rm -rf node_modules package-lock.json
npm install
```

### Bước 4: Convert ảnh hiện có sang WebP

```bash
# Convert tất cả ảnh trong /uploads
npm run convert:uploads
```

**Kết quả mong đợi:**
```
✅ Converted: 8 files
💾 Total savings: 1.06 MB
```

### Bước 5: (Tùy chọn) Update database URLs

**Cách 1: Không làm gì** (Khuyến nghị)
- API tự động fallback sang WebP
- Không cần update database
- An toàn hơn

**Cách 2: Update database URLs**
```bash
npm run update:db-urls
```

**Kết quả:**
```
✅ Updated: 8 records
   /uploads/image.jpg → /uploads/image.webp
```

### Bước 6: Build application

```bash
# Build với memory limit cho VPS
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Hoặc dùng script VPS
npm run build:vps
```

**Nếu build thành công:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

### Bước 7: Restart application

**Nếu dùng PM2:**
```bash
# Restart app
pm2 restart vpg-website

# Hoặc reload (zero-downtime)
pm2 reload vpg-website

# Check status
pm2 status
pm2 logs vpg-website --lines 50
```

**Nếu dùng systemd:**
```bash
sudo systemctl restart vpg-website
sudo systemctl status vpg-website
```

**Nếu chạy trực tiếp:**
```bash
# Stop app hiện tại (Ctrl+C hoặc kill process)
# Start lại
npm start
```

### Bước 8: Verify deployment

```bash
# 1. Check app đang chạy
curl http://localhost:3000

# 2. Check WebP serving
curl -I http://localhost:3000/uploads/image.jpg
# Expect: Content-Type: image/webp

# 3. Check logs
pm2 logs vpg-website --lines 100
# Hoặc
tail -f logs/out.log
```

## 🧪 Test sau khi deploy

### 1. Test upload ảnh mới

```bash
# Upload ảnh qua admin panel
# Kiểm tra file được tạo:
ls -lh public/uploads/ | grep webp

# Expect: File .webp được tạo tự động
```

### 2. Test ảnh cũ

```bash
# Truy cập ảnh cũ (URL JPG trong DB)
curl -I http://your-domain.com/uploads/old-image.jpg

# Expect headers:
# Content-Type: image/webp
# X-WebP-Fallback: true
```

### 3. Test performance

```bash
# Run Lighthouse
# Hoặc dùng PageSpeed Insights
# https://pagespeed.web.dev/
```

## 📊 Checklist Deploy

### Trước deploy
- [ ] Backup database
- [ ] Backup code hiện tại
- [ ] Backup thư mục uploads
- [ ] Test code trên local
- [ ] Commit code

### Trong quá trình deploy
- [ ] Copy code lên VPS
- [ ] Cài đặt dependencies
- [ ] Convert uploads sang WebP
- [ ] Build application
- [ ] Restart app

### Sau deploy
- [ ] Verify app đang chạy
- [ ] Test upload ảnh mới
- [ ] Test ảnh cũ (auto-fallback)
- [ ] Check logs không có error
- [ ] Test performance (Lighthouse)
- [ ] Monitor memory usage

## 🔧 Troubleshooting

### Build failed

**Lỗi: Out of memory**
```bash
# Tăng memory limit
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

**Lỗi: Dependencies missing**
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install
```

**Lỗi: Sharp missing linux-x64 runtime**
```bash
# Lỗi: Could not load the "sharp" module using the linux-x64 runtime
# Fix: Cài đặt riêng cho platform linux
npm install --os=linux --cpu=x64 sharp
```

**Lỗi: Unsupported CPU (requires v2 microarchitecture)**
```bash
# Lỗi: Prebuilt binaries for linux-x64 require v2 microarchitecture
# Nguyên nhân: CPU của VPS đời cũ (thiếu AVX support)
# Fix: Build từ source (sẽ tốn vài phút)
# 1. Gỡ bản cũ
npm uninstall sharp
# 2. Cài dependency & build tools
# (Ubuntu/Debian)
apt-get update && apt-get install -y build-essential libvips-dev pkg-config
npm install node-addon-api node-gyp
# 3. Cài lại với flag build
npm install --build-from-source sharp
```

### App không start

**Check logs:**
```bash
pm2 logs vpg-website --err
```

**Common issues:**
- Port đã được sử dụng → Đổi port trong .env
- Database connection failed → Check DATABASE_URL
- Missing .env file → Copy .env từ backup

### Ảnh không hiển thị

**Check file tồn tại:**
```bash
ls -la public/uploads/
```

**Check permissions:**
```bash
chmod -R 755 public/uploads/
chown -R www-data:www-data public/uploads/
```

**Check API logs:**
```bash
pm2 logs vpg-website | grep "serve-upload"
```

### Memory cao

**Check memory:**
```bash
free -h
pm2 monit
```

**Restart nếu cần:**
```bash
pm2 restart vpg-website
```

## 📝 Script Deploy Tự Động

Tạo file `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# 1. Backup
echo "📦 Creating backup..."
pg_dump -U postgres dbname > backup_$(date +%Y%m%d_%H%M%S).sql
tar -czf backup_uploads_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads/

# 2. Pull code
echo "📥 Pulling latest code..."
git pull origin main

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# 4. Convert images
echo "🖼️  Converting images to WebP..."
npm run convert:uploads

# 5. Build
echo "🔨 Building application..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 6. Restart
echo "🔄 Restarting application..."
pm2 reload vpg-website

# 7. Check status
echo "✅ Checking status..."
pm2 status
pm2 logs vpg-website --lines 20

echo "✨ Deployment complete!"
```

**Sử dụng:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🎯 Kết quả mong đợi

Sau khi deploy thành công:

### Performance
- ✅ LCP < 2.5s
- ✅ FCP < 1.8s
- ✅ PageSpeed score 85-90+

### Images
- ✅ Upload mới → Tự động WebP
- ✅ Ảnh cũ → Auto-fallback WebP
- ✅ Giảm 70% bandwidth

### Memory
- ✅ Memory usage: 800MB-1.2GB
- ✅ Không OOM crashes
- ✅ Stable performance

## 📞 Support

Nếu có vấn đề:

1. **Check logs:**
   ```bash
   pm2 logs vpg-website --lines 100
   ```

2. **Check system:**
   ```bash
   free -h
   df -h
   top
   ```

3. **Rollback nếu cần:**
   ```bash
   # Restore code
   tar -xzf backup_code_YYYYMMDD_HHMMSS.tar.gz
   
   # Restore database
   psql -U postgres dbname < backup_YYYYMMDD_HHMMSS.sql
   
   # Restart
   pm2 restart vpg-website
   ```

## ✨ Summary

**Quy trình deploy đơn giản:**

```bash
# 1. Backup
pg_dump -U postgres dbname > backup.sql

# 2. Copy code
git pull  # hoặc scp

# 3. Install
npm ci

# 4. Convert images
npm run convert:uploads

# 5. Build
npm run build

# 6. Restart
pm2 reload vpg-website

# 7. Verify
pm2 logs vpg-website
curl http://localhost:3000
```

**Xong! 🎉**
