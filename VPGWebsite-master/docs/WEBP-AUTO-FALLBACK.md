# WebP Auto-Fallback System

## Tổng quan

Hệ thống tự động phát hiện và serve WebP cho URLs cũ trong database, không cần update database thủ công.

## Cách hoạt động

### 1. Auto-Fallback trong API

Khi browser request ảnh (ví dụ: `/uploads/image.jpg`):

```
Request: /uploads/1234567890-car.jpg
         ↓
API kiểm tra: 1234567890-car.jpg có tồn tại?
         ↓ (không)
API tìm: 1234567890-car.webp có tồn tại?
         ↓ (có)
Response: Serve 1234567890-car.webp
Header: X-WebP-Fallback: true
```

### 2. Prefer WebP

Nếu cả 2 file đều tồn tại, ưu tiên WebP:

```
Request: /uploads/1234567890-car.jpg
         ↓
API kiểm tra: 1234567890-car.jpg ✅
API kiểm tra: 1234567890-car.webp ✅
         ↓
Response: Serve 1234567890-car.webp (nhỏ hơn)
Header: X-WebP-Fallback: true
```

## Quy trình Deploy

### Bước 1: Convert ảnh hiện có

```bash
npm run convert:uploads
```

Kết quả:
```
✅ Converted: 8 files
💾 Total savings: 1.06 MB
```

### Bước 2 (Tùy chọn): Update Database

**Cách 1: Không làm gì** (Khuyến nghị)
- API tự động fallback sang WebP
- Không cần update database
- Hoạt động ngay lập tức

**Cách 2: Update database URLs**
```bash
npm run update:db-urls
```

Kết quả:
```
✅ Updated: 8 records
   /uploads/image.jpg → /uploads/image.webp
```

### Bước 3: Deploy

```bash
npm run build
npm start
# Hoặc
npm run start:pm2
```

## So sánh 2 cách

### Cách 1: Không update database (Khuyến nghị)

**Ưu điểm:**
- ✅ Không cần chạm vào database
- ✅ Không có downtime
- ✅ Rollback dễ dàng (xóa file WebP)
- ✅ Tự động hoạt động

**Nhược điểm:**
- ⚠️ Header có `X-WebP-Fallback: true`
- ⚠️ Log mỗi request (có thể tắt)

**Khi nào dùng:**
- Production đang chạy
- Không muốn risk
- Cần deploy nhanh

### Cách 2: Update database URLs

**Ưu điểm:**
- ✅ Database URLs chính xác
- ✅ Không cần fallback logic
- ✅ Sạch hơn về mặt kiến trúc

**Nhược điểm:**
- ⚠️ Phải update database
- ⚠️ Cần backup trước
- ⚠️ Khó rollback

**Khi nào dùng:**
- Môi trường dev/staging
- Có thể backup database
- Muốn URLs chính xác

## Ví dụ thực tế

### Database có URL cũ

```sql
SELECT imageUrl FROM CarImage;
-- /uploads/1234567890-car.jpg
-- /uploads/1234567890-car2.png
```

### Sau khi convert

```bash
npm run convert:uploads
```

Files trong `/public/uploads`:
```
1234567890-car.jpg      (154 KB - giữ lại)
1234567890-car.webp     (51 KB - mới)
1234567890-car2.png     (281 KB - giữ lại)
1234567890-car2.webp    (54 KB - mới)
```

### Request từ browser

```javascript
// Component code
<Image src="/uploads/1234567890-car.jpg" />

// Browser request
GET /uploads/1234567890-car.jpg

// API response
Content-Type: image/webp
X-WebP-Fallback: true
[WebP binary data - 51 KB]
```

**Kết quả:** Browser nhận WebP (51 KB) thay vì JPG (154 KB) ✅

## Monitoring

### Check logs

```bash
# Development
npm run dev
# Xem console khi load ảnh

# Production (PM2)
pm2 logs vpg-website | grep "Auto-fallback"
pm2 logs vpg-website | grep "Prefer WebP"
```

### Verify headers

```bash
curl -I http://localhost:3000/uploads/1234567890-car.jpg

# Response:
HTTP/1.1 200 OK
Content-Type: image/webp
X-WebP-Fallback: true
Cache-Control: public, max-age=31536000, immutable
```

## Troubleshooting

### Ảnh vẫn load JPG/PNG

**Nguyên nhân:** WebP file chưa được tạo

**Giải pháp:**
```bash
npm run convert:uploads
```

### Database URLs không đổi

**Đây là bình thường!** API tự động fallback sang WebP.

Nếu muốn update:
```bash
npm run update:db-urls
```

### Logs quá nhiều

**Tắt console.log trong production:**

Edit `src/app/api/serve-upload/[...path]/route.ts`:
```typescript
// Xóa hoặc comment dòng này:
// console.log(`✅ Auto-fallback: ${filePath} → ${webpPath}`)
// console.log(`✅ Prefer WebP: ${filePath} → ${webpPath}`)
```

## Performance Impact

### Trước

```
Request: /uploads/car.jpg (154 KB)
Response: 154 KB JPG
Time: 200ms
```

### Sau (Auto-fallback)

```
Request: /uploads/car.jpg
API check: car.jpg? No
API check: car.webp? Yes
Response: 51 KB WebP
Time: 205ms (+5ms overhead)
```

**Overhead:** ~5ms (kiểm tra file tồn tại)
**Savings:** 103 KB (67% nhỏ hơn)

**Kết luận:** Đáng giá! 5ms overhead để tiết kiệm 67% bandwidth.

## Best Practices

### 1. Convert ngay sau upload

✅ **Tốt:** Upload → Auto-convert → Lưu WebP
```javascript
// API đã tự động làm điều này
POST /api/upload
→ Nhận JPG 500KB
→ Convert sang WebP 150KB
→ Lưu WebP
→ Trả về URL WebP
```

### 2. Giữ file gốc

✅ **Tốt:** Giữ cả JPG và WebP
- Backup an toàn
- Fallback nếu WebP lỗi
- Có thể rollback

❌ **Không tốt:** Xóa file gốc ngay
- Mất backup
- Không thể rollback

### 3. Batch convert định kỳ

```bash
# Cron job (mỗi ngày 2AM)
0 2 * * * cd /path/to/app && npm run convert:uploads
```

### 4. Monitor logs

```bash
# Setup alert nếu quá nhiều fallback
pm2 logs | grep "Auto-fallback" | wc -l
# Nếu > 1000/hour → Cần update database
```

## Summary

**Không cần update database!** 

Hệ thống tự động:
1. ✅ Phát hiện request ảnh cũ (JPG/PNG)
2. ✅ Tìm phiên bản WebP
3. ✅ Serve WebP nếu có
4. ✅ Tiết kiệm 70% bandwidth
5. ✅ Không downtime
6. ✅ Rollback dễ dàng

**Chỉ cần:**
```bash
npm run convert:uploads  # Convert ảnh hiện có
npm run build            # Build
npm start                # Deploy
```

**Xong!** Mọi thứ tự động hoạt động.
