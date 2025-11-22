# VPG Auto - VinFast Dealership Website

Dự án website đại lý xe VinFast với NextJS 14, PostgreSQL, và Docker.

## 🚀 Tính năng

### Giao diện người dùng:
- **Trang chủ**: Banner slide, danh sách xe, khách hàng
- **Chi tiết xe**: Slide hình ảnh, thông tin xe, phiên bản, bài viết giới thiệu
- **Bảng giá**: Danh sách tất cả xe và giá
- **Tính tiền trả góp**: Công cụ tính toán chi tiết khoản vay
- **Dự toán chi phí**: Tính tổng chi phí mua xe

### Quản trị Admin:
- **Quản lý xe**: Thêm, sửa, xóa xe và phiên bản
- **Quản lý đăng ký lái thử**: Xem danh sách người đăng ký
- **Quản lý báo giá**: Xem yêu cầu báo giá từ khách hàng
- **Quản lý khách hàng**: Thêm, sửa, xóa khách hàng hiển thị trên trang chủ

## 📋 Yêu cầu hệ thống

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (cho deployment)

## 🛠️ Cài đặt Development

### 1. Clone repository
```bash
git clone <repository-url>
cd VPGWebsite
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình environment
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```env
DATABASE_URL="postgresql://vpg_user:vpg_password@localhost:5432/vpg_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Khởi động PostgreSQL (nếu chưa có)
```bash
docker run --name vpg-postgres -e POSTGRES_USER=vpg_user -e POSTGRES_PASSWORD=vpg_password -e POSTGRES_DB=vpg_db -p 5432:5432 -d postgres:15-alpine
```

### 5. Chạy migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Seed dữ liệu mẫu
```bash
npx prisma db seed
```

### 7. Chạy development server
```bash
npm run dev
```

Truy cập: http://localhost:3000

**Admin login:**
- Username: `admin`
- Password: `admin123`

## 🐳 Deployment lên VPS Ubuntu

### Chuẩn bị VPS

1. **Cập nhật hệ thống**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Cài đặt Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

3. **Cài đặt Docker Compose**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

4. **Logout và login lại để áp dụng quyền Docker**

### Deploy ứng dụng

1. **Upload code lên VPS**
```bash
# Trên máy local
scp -r . root@your-vps-ip:/root/vpgwebsite
```

Hoặc clone từ git:
```bash
ssh root@your-vps-ip
cd /root
git clone <repository-url> vpgwebsite
cd vpgwebsite
```

2. **Cấu hình environment trên VPS**
```bash
cd /root/vpgwebsite
nano .env
```

Nội dung `.env`:
```env
DATABASE_URL="postgresql://vpg_user:vpg_password@db_host:5432/vpg_db"
NEXTAUTH_URL="http://your-vps-ip:3000"
NEXTAUTH_SECRET="your-production-secret-key-change-this"
```

3. **Build và chạy với Docker Compose**
```bash
docker-compose up -d --build
```

4. **Chạy migrations**
```bash
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma generate
```

5. **Seed dữ liệu (nếu cần)**
```bash
docker-compose exec app npx prisma db seed
```

6. **Tạo thư mục uploads**
```bash
mkdir -p /root/vpgwebsite/public/uploads
chmod 777 /root/vpgwebsite/public/uploads
```

### Kiểm tra logs
```bash
docker-compose logs -f app
```

### Dừng ứng dụng
```bash
docker-compose down
```

### Khởi động lại
```bash
docker-compose up -d
```

## 📁 Cấu trúc thư mục

```
VPGWebsite/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/
│   └── uploads/               # Uploaded images
├── src/
│   ├── app/
│   │   ├── admin/            # Admin pages
│   │   ├── api/              # API routes
│   │   ├── cars/             # Car detail pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # React components
│   ├── lib/                  # Utilities
│   └── types/                # TypeScript types
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🔧 Cấu hình nâng cao

### Thay đổi port
Chỉnh sửa `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "8080:3000"  # Thay vì 3000:3000
```

### Backup database
```bash
docker-compose exec db_host pg_dump -U vpg_user vpg_db > backup.sql
```

### Restore database
```bash
cat backup.sql | docker-compose exec -T db_host psql -U vpg_user vpg_db
```

### SSL/HTTPS với Nginx
Cài đặt Nginx và Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Cấu hình Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Cài đặt SSL:
```bash
sudo certbot --nginx -d your-domain.com
```

## 📊 Database Schema

### Tables:
- **admins**: Admin users
- **cars**: Car models
- **car_versions**: Car versions with prices
- **car_images**: Car image gallery
- **test_drives**: Test drive registrations
- **price_quotes**: Price quote requests
- **customers**: Customer testimonials

## 🔐 Bảo mật

1. **Thay đổi mật khẩu admin mặc định** ngay sau khi deploy
2. **Sử dụng NEXTAUTH_SECRET mạnh** trong production
3. **Cấu hình firewall** trên VPS:
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📝 API Endpoints

### Public APIs:
- `GET /api/cars` - Lấy danh sách xe
- `GET /api/cars/slug/[slug]` - Lấy chi tiết xe theo slug
- `POST /api/test-drives` - Đăng ký lái thử
- `POST /api/price-quotes` - Đăng ký báo giá
- `GET /api/customers` - Lấy danh sách khách hàng

### Admin APIs (cần authentication):
- `POST /api/cars` - Tạo xe mới
- `PUT /api/cars/[id]` - Cập nhật xe
- `DELETE /api/cars/[id]` - Xóa xe
- `POST /api/upload` - Upload hình ảnh

## 🐛 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra container đang chạy
docker-compose ps

# Kiểm tra logs
docker-compose logs db_host
```

### Lỗi permission khi upload:
```bash
chmod -R 777 /root/vpgwebsite/public/uploads
```

### Reset database:
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

## 📞 Hỗ trợ

Để được hỗ trợ, vui lòng tạo issue trên repository hoặc liên hệ qua email.

## 🔔 Zalo OA Notifications

To enable notifications to your personal Zalo through your Official Account (OA), set the following environment variables in your `.env` (or in production):

```env
ZALO_OA_ACCESS_TOKEN="your_zalo_oa_access_token"
ZALO_OA_ADMIN_PHONE="+849XXXXXXXX"
```

- `ZALO_OA_ACCESS_TOKEN`: Access token for your Zalo OA (server key).
- `ZALO_OA_ADMIN_PHONE`: The admin phone number to receive messages (international format, e.g. `+849...`).

The application will attempt to send a short text notification to the admin when customers create price quote requests or test drive registrations. Notifications are best-effort and will not block the API response if they fail.

Control sending behavior with environment flags:

```env
# Send Zalo OA messages (true/false)
SEND_ZALO=true

# Send emails via SMTP (true/false)
SEND_MAIL=true
```

Set these to `false` to disable sending in development or staging.

## ✉️ Email Notifications (SMTP)

To receive email notifications when users request price quotes or test drives, configure SMTP variables in your environment:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user@example.com
SMTP_PASS=your_smtp_password
EMAIL_ADMIN=you@example.com
```

- `SMTP_HOST`: SMTP server host.
- `SMTP_PORT`: SMTP server port (587, 465, etc.).
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password.
- `EMAIL_ADMIN`: Admin email address to receive notifications.

The application uses `nodemailer` (loaded dynamically) to send mail from server-side API routes. Failures are logged and do not block the API response.

Testing locally: you can use a testing SMTP service such as Mailtrap, or Gmail SMTP (with App Password) for quick tests.

## 📄 License

MIT License
