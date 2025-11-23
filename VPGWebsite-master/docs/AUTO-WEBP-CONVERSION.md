# Auto WebP Conversion Guide

## Tính năng

✅ **Auto-convert khi upload**: Mọi ảnh upload lên sẽ tự động convert sang WebP
✅ **Batch convert**: Convert tất cả ảnh có sẵn trong `/uploads`
✅ **Dynamic serving**: Ảnh upload sau khi build vẫn hiển thị bình thường

## 1. Auto-Convert Khi Upload

### Cách hoạt động

Khi user upload ảnh qua API `/api/upload`, hệ thống sẽ:

1. Nhận file upload
2. Kiểm tra định dạng (JPG, PNG, GIF, BMP, TIFF)
3. Tự động convert sang WebP (quality 85%)
4. Lưu file WebP
5. Trả về URL của file WebP

### Định dạng được convert

- `.jpg`, `.jpeg` → `.webp`
- `.png` → `.webp`
- `.gif` → `.webp`
- `.bmp` → `.webp`
- `.tiff` → `.webp`

### Kết quả

API sẽ trả về thông tin chi tiết:

```json
{
  "url": "/uploads/1234567890-image.webp",
  "filename": "1234567890-image.webp",
  "originalSize": 500000,
  "finalSize": 150000,
  "savings": 70,
  "converted": true
}
```

## 2. Convert Ảnh Có Sẵn

### Chạy script convert

```bash
npm run convert:uploads
```

### Kết quả

```
🖼️  Converting all images in /uploads to WebP...

✅ image1.jpg
   → image1.webp
   📊 154.88 KB → 117.20 KB (24.3% smaller)

✅ image2.png
   → image2.webp
   📊 281.25 KB → 53.65 KB (80.9% smaller)

📊 Conversion Summary:
   ✅ Converted: 8 files
   💾 Total savings: 1.06 MB
```

### Lưu ý

- File gốc được giữ lại để đảm bảo an toàn
- Bạn có thể xóa file gốc sau khi verify WebP hoạt động tốt
- Script tự động bỏ qua file đã có phiên bản WebP

## 3. Fix Vấn Đề Ảnh Sau Build

### Vấn đề

Khi chạy `npm run build`, Next.js copy static files từ `/public` vào `.next/static`. Ảnh upload sau khi build sẽ không được copy và không hiển thị.

### Giải pháp

Đã implement **dynamic file serving** qua API route:

```
/uploads/image.webp → /api/serve-upload/image.webp
```

### Cách hoạt động

1. Next.js rewrite `/uploads/*` → `/api/serve-upload/*`
2. API route đọc file từ `/public/uploads/`
3. Trả về file với cache headers phù hợp

### Lợi ích

✅ Ảnh upload sau build vẫn hiển thị
✅ Cache 1 năm cho performance
✅ Không cần rebuild khi có ảnh mới
✅ Hoạt động cả dev và production

## 4. Cấu Trúc Files

```
src/
├── app/
│   └── api/
│       ├── upload/
│       │   └── route.ts          # Upload + auto WebP conversion
│       └── serve-upload/
│           └── [...path]/
│               └── route.ts      # Serve uploaded files dynamically
scripts/
├── convert-images.js             # Convert static images (logo, etc)
└── convert-uploads.js            # Convert all uploads to WebP
public/
└── uploads/                      # User uploaded files
    ├── image1.jpg               # Original (kept for safety)
    ├── image1.webp              # WebP version (used)
    ├── image2.png
    └── image2.webp
```

## 5. Sử Dụng

### Upload ảnh mới

```javascript
const formData = new FormData()
formData.append('file', imageFile)
formData.append('createDb', 'true')
formData.append('imageType', 'main')
formData.append('carId', '123')

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const result = await response.json()
console.log(result.url) // /uploads/1234567890-image.webp
console.log(result.savings) // 70% smaller
```

### Hiển thị ảnh

```tsx
import Image from 'next/image'

<Image
  src="/uploads/1234567890-image.webp"
  alt="Car image"
  width={800}
  height={600}
/>
```

## 6. Performance

### Trước tối ưu

- Upload JPG 500KB → Lưu 500KB
- Tải ảnh: 500KB
- Không cache

### Sau tối ưu

- Upload JPG 500KB → Convert → Lưu 150KB WebP (70% nhỏ hơn)
- Tải ảnh: 150KB
- Cache 1 năm

### Kết quả

✅ **Giảm 70% dung lượng** ảnh
✅ **Tải nhanh hơn 3x**
✅ **Tiết kiệm bandwidth**
✅ **Tốt cho SEO** (PageSpeed Insights)

## 7. Troubleshooting

### Ảnh không hiển thị sau upload

**Nguyên nhân**: Cache browser

**Giải pháp**:
```bash
# Hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Lỗi "Sharp not found"

**Nguyên nhân**: Chưa cài Sharp

**Giải pháp**:
```bash
npm install sharp
```

### Ảnh bị mờ sau convert

**Nguyên nhân**: Quality quá thấp

**Giải pháp**: Sửa quality trong `src/app/api/upload/route.ts`:
```typescript
.webp({ quality: 90 }) // Tăng từ 85 lên 90
```

### Convert uploads bị lỗi

**Nguyên nhân**: Thư mục không tồn tại

**Giải pháp**:
```bash
mkdir -p public/uploads
npm run convert:uploads
```

## 8. Deployment

### Trước deploy

```bash
# 1. Convert tất cả ảnh hiện có
npm run convert:uploads

# 2. Build application
npm run build

# 3. Deploy
```

### Sau deploy

- Ảnh mới upload sẽ tự động convert sang WebP
- Không cần rebuild khi có ảnh mới
- Mọi thứ hoạt động tự động

## 9. Monitoring

### Check conversion logs

```bash
# Development
npm run dev
# Upload ảnh và xem console

# Production (PM2)
pm2 logs vpg-website | grep "Converted"
```

### Verify WebP files

```bash
# List WebP files
ls -lh public/uploads/*.webp

# Count conversions
ls public/uploads/*.webp | wc -l
```

## 10. Best Practices

✅ **Luôn convert sang WebP** - Tiết kiệm bandwidth
✅ **Giữ file gốc** - Backup an toàn
✅ **Quality 85%** - Cân bằng chất lượng/kích thước
✅ **Cache 1 năm** - Tối ưu performance
✅ **Monitor logs** - Theo dõi conversion

## Summary

Hệ thống tự động:
1. ✅ Convert ảnh upload sang WebP
2. ✅ Serve ảnh động (không cần rebuild)
3. ✅ Cache tối ưu (1 năm)
4. ✅ Giảm 70% dung lượng
5. ✅ Tăng tốc tải trang

**Không cần làm gì thêm - mọi thứ tự động!**
