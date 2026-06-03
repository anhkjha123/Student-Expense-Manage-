# Student Expense Manager - Ứng dụng Quản lý Chi tiêu Sinh viên

Một ứng dụng web tinh tế, hiện đại, gọn nhẹ giúp sinh viên dễ dàng ghi chép chi tiêu trong vòng dưới 10 giây, phân bổ dòng tiền thông minh theo mô hình Cần thiết vs Mong muốn (Needs/Wants) và đề phòng lạm phát cháy túi cuối tháng.

Ứng dụng được viết hoàn toàn bằng **React 19**, **TypeScript**, **Tailwind CSS v4** và được tối ưu hóa hiển thị tuyệt hảo trên mọi thiết bị di động.

---

## 🎨 Điểm Nhấn Thiết Kế & Tính Năng Nổi Bật

1.  **Nhập Chi Tiêu 10 Giây:** Giao diện nhập chi tiêu siêu tốc, phân định danh mục rõ ràng, tự động định dạng số tiền VND thời gian thực.
2.  **Chống Tràn Màn Hình Di Động:** Thiết kế Modal nén tỷ lệ và bổ sung cuộn nội bộ tự động đặc biệt bảo vệ nút lưu trên tất cả các điện thoại thông minh dù nhỏ nhất.
3.  **Hạn Mức Ngân Sách Thông Minh:** Cảnh báo đỏ tức thời ngay khi một danh mục chi tiêu chạm ngưỡng 80% hoặc 100% giới hạn ngân sách tự đề ra.
4.  **Dự Báo Tài Chính Cuối Tháng:** Mô phỏng số tiền tích lũy/tiết kiệm thực tế dựa trên tốc độ và xu hướng tiêu xài hiện tại của chính người dùng.
5.  **Báo Cáo Biểu Đồ Trực Quan:** Hiển thị lưu đồ tròn tỷ trọng các khoản chi, đối chiếu so sánh nhóm Needs/Wants để phát hiện quỹ tiền bị rò rỉ.
6.  **Bảo Mật Tuyệt Đối (Offline-First):** Toàn bộ dữ liệu nằm an toàn tại LocalStorage của thiết bị người dùng.

---

## 📂 Tổ Chức Thư Mục Dự Án (Project Model)

Dự án được đồng bộ tỉ mỉ, ngăn nắp theo cấu trúc module chuyên nghiệp:

```text
projectmodel
├── doc/
│   ├── spec.md                     # Tài liệu Đặc tả Yêu cầu Hệ thống (SRS)
│   ├── Architecture.md             # Tài liệu Thiết kế Kiến trúc (ADR)
│   └── changeLog.md                # Nhật ký theo dõi lịch sử cập nhật
├── src/
│   ├── components/                 # Các module giao diện trực quan độc lập
│   │   ├── AddExpenseModal.tsx     # Thiết kế biểu mẫu nhập chi tiêu thông minh
│   │   ├── BudgetSettings.tsx     # Quản lý hạn mức và cảnh báo giới hạn chi tiêu
│   │   ├── Dashboard.tsx           # Tổng hợp các thẻ thống kê tổng quan (Dashboard)
│   │   ├── ExpenseHistory.tsx      # Sổ ghi chép giao dịch, bộ lọc và tìm kiếm nâng cao
│   │   ├── LoginRegister.tsx       # Màn hình định danh người dùng và cấu hình chu cấp đầu kỳ
│   │   ├── Navbar.tsx              # Thanh điều chuyển hướng và hòm thư cảnh báo động
│   │   └── Reports.tsx             # Trang biểu đồ phân tích cơ cấu chi tiêu
│   ├── types.ts                    # Khai báo kiểu thực thể dữ liệu TypeScript chặt chẽ
│   ├── mockData.ts                 # Dữ liệu giả lập phong phú khởi tạo ban đầu
│   ├── App.tsx                     # Điểm đầu não điều phối toàn bộ trạng thái hệ thống
│   ├── main.tsx                    # File mồi khởi chạy thư viện React
│   └── index.css                   # Định nghĩa phong cách CSS & Tailwind v4
├── tests/
│   └── expenses.test.ts            # Các ca kiểm thử đơn vị tự động (Unit Tests)
├── package.json                    # Khai báo các kịch bản chạy và thư viện liên quan
├── env.example                     # Bản mẫu khai báo biến cấu hình môi trường
└── readme.md                       # Bản hướng dẫn cài đặt và vận hành hệ thống (File này)
```

---

## 🛠️ Trình Tự Khởi Tạo & Vận Hành Hệ Thống

Để tiến hành khởi chạy hoặc thử nghiệm hệ thống trong dự án này, thực hiện theo các bước cụ thể dưới đây:

### 1. Cài đặt các thư viện liên quan
Sử dụng công cụ quản lý gói npm để cài đặt đầy đủ các thư viện phụ thuộc của dự án:
```bash
npm install
```

### 2. Khởi động môi trường phát triển (Development Mode)
Khởi chạy máy chủ phát triển nội bộ để kiểm tra giao diện ứng dụng thời gian thực thích ứng trên cổng `3000`:
```bash
npm run dev
```

### 3. Biên dịch dự án phục vụ triển khai (Production Build)
Tiến hành đóng gói các tệp nguồn thành sản phẩm tĩnh tối ưu hóa cao chứa trong thư mục `dist`:
```bash
npm run build
```

### 4. Kiểm tra tính toàn vẹn cú pháp (Linting)
Sử dụng TypeScript Compiler để kiểm tra xem mã nguồn có bất kỳ lỗi khai báo kiểu hay lỗi cú pháp nghiêm trọng nào hay không:
```bash
npm run lint
```

### 5. Chạy các ca kiểm thử tự động (Unit Testing)
Khởi chạy trình chạy kiểm thử Vitest để tự động rà soát hoạt động của các bộ tính toán logic tài chính:
```bash
npm run test
```

---

## 🧪 Hệ Thống Kiểm Thử Tự Động (Testing Suite)
Chúng tôi đã tích hợp sẵn thư viện **Vitest** hỗ trợ thực hiện kiểm thử tự động tại thư mục `/tests/`. Lịch trình kiểm thử bao gồm việc rà soát:
*   Độ chính xác của các biến tính toán phái sinh chỉ số trên Dashboard.
*   Công thức dự báo số dư tích lũy cuối kì dựa trên xu hướng chi tiêu thực tế.
*   Các quy tắc ràng buộc logic dữ liệu đầu vào khi thực hiện nhập giao dịch mới.
