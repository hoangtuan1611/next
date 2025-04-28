# Hướng dẫn sử dụng dự án

## 1. Backend (.NET)

### a) Di chuyển vào thư mục backend

```bash
cd backend
```

### b) Khởi tạo cơ sở dữ liệu

1. Tạo migration đầu tiên:
   ```bash
   dotnet ef migrations add InitialCreate
   ```
2. Cập nhật cơ sở dữ liệu:
   ```bash
   dotnet ef database update
   ```

> **Lưu ý:**  
> Nếu xảy ra lỗi kết nối cơ sở dữ liệu, kiểm tra lại tên server SQL Server (hoặc SQL Server Express) bằng cách:
>
> - Mở SQL Server Management Studio (SSMS) hoặc
> - Chạy lệnh sau để lấy tên server:
>   ```bash
>   sqllocaldb i
>   ```
>   Sau đó chỉnh sửa lại chuỗi kết nối trong file `appsettings.json`:

```json
"ConnectionStrings": {
  "Default": "Server=YOUR-SERVER-NAME; Database=DoAnTotNghiep; Trusted_Connection=True; TrustServerCertificate=True;"
}
```

Ví dụ server name có thể là:

- `localhost`
- `localhost\SQLEXPRESS`
- hoặc tên instance khác tuỳ máy.

3. Nếu cần, mở file `query.sql` và thực thi script để tạo database thủ công.

### c) Khởi chạy backend

```bash
dotnet run
```

- Backend mặc định chạy tại địa chỉ: `https://localhost:5001` (hoặc địa chỉ khác theo cấu hình).

---

## 2. Frontend (React - pnpm)

### a) Di chuyển vào thư mục frontend

```bash
cd frontend
```

### b) Cài đặt thư viện

```bash
pnpm install
```

### c) Khởi chạy frontend

```bash
pnpm dev
```

- Frontend mặc định chạy tại địa chỉ: `http://localhost:5173`

---

## 3. Yêu cầu hệ thống

- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (>= 7.0 hoặc 8.0)
- [Node.js](https://nodejs.org/) (>= 18.x)
- [pnpm](https://pnpm.io/installation)
- SQL Server hoặc SQL Server Express

---

## 4. Một số lưu ý khác

- Nếu gặp lỗi cổng hoặc SSL, kiểm tra lại file `launchSettings.json` (backend) và `.env` (frontend) nếu có.
- Nếu sử dụng SQL Server Express, có thể cần enable TCP/IP trong SQL Server Configuration Manager.
- Khi thay đổi chuỗi kết nối, hãy đảm bảo tên database (`DoAnTotNghiep`) đúng hoặc đã được tạo sẵn.

---

> **Note:**  
> Nếu cần, bạn có thể tạo các file `.env` để cấu hình động các URL backend trong frontend.

---
