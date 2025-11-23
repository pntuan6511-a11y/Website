# 🚀 Quick Deploy Guide - VPS với DB có sẵn

## Quy trình deploy nhanh (5 phút)

### 1️⃣ Backup (1 phút)
```bash
# Trên VPS
pg_dump -U postgres dbname > backup_$(date +%Y%m%d).sql
tar -czf backup_uploads.tar.gz public/uploads/
```

### 2️⃣ Copy code (2 phút)
```bash
# Cách 1: Git (khuyến nghị)
git pull origin main

# Cách 2: SCP từ local
scp -r . user@vps-ip:/path/to/app/
```

### 3️⃣ Install & Convert (1 phút)
```bash
npm ci
npm run convert:uploads
```

### 4️⃣ Build & Restart (1 phút)
```bash
npm run build
pm2 reload vpg-website
```

### 5️⃣ Verify
```bash
pm2 logs vpg-website --lines 20
curl http://localhost:3000
```

## ✅ Checklist

- [ ] Backup DB ✓
- [ ] Backup uploads ✓
- [ ] Copy code ✓
- [ ] npm ci ✓
- [ ] convert:uploads ✓
- [ ] npm run build ✓
- [ ] pm2 reload ✓
- [ ] Test app ✓

## 🆘 Nếu có lỗi

**Build failed:**
```bash
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

**App crash:**
```bash
pm2 logs vpg-website --err
pm2 restart vpg-website
```

**Rollback:**
```bash
git reset --hard HEAD~1
npm run build
pm2 restart vpg-website
```

## 📊 Kết quả

- ✅ WebP auto-convert
- ✅ Auto-fallback cho ảnh cũ
- ✅ 70% nhỏ hơn
- ✅ LCP < 2.5s

**Xong! 🎉**
