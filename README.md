# SMART PARKING – BACKEND (NODE.JS / EXPRESS)

Backend cho hệ thống **Smart Parking (Quản lý bãi đỗ xe thông minh)**, xây dựng bằng **Node.js + Express**, đóng vai trò cung cấp **RESTful API**, xử lý **xác thực – phân quyền**, kết nối **MongoDB Atlas**, và làm trung gian giao tiếp với **IoT / Frontend**.

---

## 1. Mô tả dự án (ngắn gọn)

Hệ thống Backend Smart Parking chịu trách nhiệm:

- Quản lý **tài khoản Admin / User** (JWT Authentication)
- Cung cấp API cho **Dashboard, Map, Thống kê**
- Lưu trữ & xử lý dữ liệu **xe ra/vào, bãi đỗ**
- Kết nối dữ liệu từ **IoT**
- Đảm bảo bảo mật, chuẩn hóa dữ liệu và mở rộng dễ dàng

---

## 2. Công nghệ sử dụng

### Core

- **Node.js** – Runtime
- **Express 5** – Web framework

### Database

- **MongoDB** – NoSQL Database
- **Mongoose** – ODM cho MongoDB

### Auth & Security

- **JWT (jsonwebtoken)** – Xác thực & phân quyền
- **bcryptjs** – Mã hóa mật khẩu
- **CORS** – Bảo mật cross-origin

### Utils & Middleware

- **dotenv** – Quản lý biến môi trường
- **morgan** – Log request

### Code Quality

- **ESLint** – Kiểm tra code
- **Prettier** – Format code
- **Nodemon** – Tự động reload khi dev

---

## 3. Kiến trúc dự án

Dự án áp dụng **Module-based Architecture** kết hợp tư duy **Layered / Clean Architecture**:

- Mỗi domain (admin, users, iot, map, auth, …) là **1 module độc lập**
- Tách rõ các layer:
  - **Route** – Điều hướng API
  - **Controller** – Nhận request / trả response
  - **Service** – Xử lý business logic
  - **Model** – Schema & database

Ưu điểm:

- Dễ bảo trì & mở rộng
- Tránh logic lẫn lộn
- Phù hợp dự án backend thực tế

---

## 4. Cấu trúc thư mục

```txt
src/
├─ c-app/
│  ├─ c-config/
│  │  ├─ db.config.js        # Kết nối MongoDB
│  │  └─ env.config.js       # Load biến môi trường
│  │
│  ├─ c-middlewares/
│  │  └─ error.middleware.js # Xử lý lỗi tập trung
│  │
│  ├─ c-module/
│  │  ├─ c-admin/
│  │  │  └─ auth/
│  │  │     ├─ auth.controller.js
│  │  │     ├─ auth.model.js
│  │  │     ├─ auth.route.js
│  │  │     └─ auth.service.js
│  │  │
│  │  ├─ c-users/
│  │  │  └─ auth/
│  │  │     ├─ auth.controller.js
│  │  │     ├─ auth.model.js
│  │  │     ├─ auth.route.js
│  │  │     └─ auth.service.js
│  │  │
│  │  └─ c-iot/
│  │
│  ├─ c-routes/
│  │  └─ routes.js           # Gom tất cả route
│  │
│  ├─ public/
│  │  └─ img/
│  │
│  ├─ index.js               # Entry point
│  └─ server.js              # Khởi tạo express server
│
├─ .env
├─ nodemon.json
├─ package.json
└─ README.md
```

---

## 5. Giải thích kiến trúc chi tiết

### 5.1 Entry Point

- `src/index.js`
  - Load env
  - Kết nối database
  - Khởi động server

- `server.js`
  - Khai báo express app
  - Middleware (json, cors, morgan)
  - Gắn routes & error handler

---

### 5.2 Module (`c-module/*`)

Mỗi module gồm:

- **route**: Định nghĩa endpoint API
- **controller**: Nhận request, validate input, trả response
- **service**: Xử lý nghiệp vụ chính
- **model**: Định nghĩa schema MongoDB

➡️ Controller **không xử lý logic phức tạp**, tất cả đưa xuống service.

---

### 5.3 Routes tổng (`c-routes/routes.js`)

- Gom route từ các module
- Prefix API (ví dụ `/api/v1`)

Ví dụ luồng:

```txt
Request → Route → Controller → Service → Model → Response
```

---

### 5.4 Middleware

- `error.middleware.js`: Xử lý lỗi tập trung
- Dễ mở rộng thêm:
  - auth middleware
  - role / permission middleware

---

### 5.5 Config

- `db.config.js`: Kết nối MongoDB Atlas
- `env.config.js`: Load & validate biến môi trường

---

## 6. Scripts

```bash
npm run dev        # Chạy server với nodemon
npm start         # Chạy production
npm run lint      # Kiểm tra code
npm run format    # Format code
npm run format:check
npm i --legacy-peer-deps # Cài đặt các phiên bản tương thích
```

---

<!-- ## 7. Định hướng mở rộng

- Áp dụng **RBAC (Role-Based Access Control)**
- Chuẩn hóa response (BaseResponse)
- Thêm **Socket.IO** cho realtime IoT
- Viết **Unit test / Integration test**
- Áp dụng Clean Architecture nâng cao

--- -->

✍️ _Author: Smart Parking Backend Team_
