# TÀI LIỆU KIẾN TRÚC HỆ THỐNG (ARCHITECTURE.MD)
## Student Expense Manager (ADR/ARD)

Tài liệu này mô tả chi tiết các quyết định kiến trúc, cơ chế quản lý dữ liệu, nâng cấp giao diện thích ứng tương thích di động và luồng hoạt động cốt lõi của ứng dụng Quản lý Chi tiêu Sinh viên.

---

### 1. Quyết định Kiến trúc & Công nghệ (Tech Stack Decisions)

| Công nghệ | Lựa chọn | Lý do chọn lựa |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Tốc độ kết xuất tối đa, kiểm soát kiểu dữ liệu nghiêm ngặt giúp giảm thiểu tối đa lỗi lúc chạy (runtime errors). |
| **Backend Framework** | Node.js + Express | Xử lý API RESTful, quản lý xác thực người dùng JWT mô phỏng và tương tác với cơ sở dữ liệu ảo tại thư mục hệ thống. |
| **Build & Dev Tool** | Vite + esbuild | Tốc độ biên dịch cực kỳ nhanh gọn. Kết hợp Vite middleware (dev) và esbuild bundle độc lập (production) cho trải nghiệm Full-stack. |
| **Styling Engine** | Tailwind CSS v4 | Thiết kế giao diện hiện đại chỉ sử dụng các lớp tiện ích (utility-first). Hỗ trợ sẵn các cơ chế tương thích di động ưu việt (`sm`, `md`, `lg`) bẩm sinh. |
| **Animation library** | Motion (`motion/react`) | Đảm bảo tính sinh động, mượt mà trong các chuyển động chuyển đổi tab, mở modal và trải nghiệm người dùng (UX Sparkles). |
| **Cơ sở dữ liệu** | **Firebase Firestore & Auth** | *(Mới nâng cấp)* Thay thế JSON file local để cho phép **đồng bộ đa thiết bị (Real-time Sync)** và hỗ trợ **chế độ ngoại tuyến (Offline Persistence)** an toàn. |
| **Testing** | Vitest | Thư viện kiểm thử tiến bộ thế hệ mới tích hợp trực tiếp vào cấu hình Vite, hoạt động cực nhanh phục vụ quá trình TDD (Test-Driven Development). |

---

### 2. Sơ đồ Cấu trúc Thư mục (Directory Structure)

Ứng dụng được tổ chức theo cấu trúc dạng module hóa cao độ để duy trì khả năng mở rộng lâu dài và ngăn ngừa sự quá tải kích thước file của trình biên dịch:

```text
├── doc/
│   ├── spec.md                     # Tài liệu Yêu cầu Sản phẩm (SRS)
│   ├── Architecture.md             # Tài liệu Kiến trúc Hệ thống (ARD) (File này)
│   └── changeLog.md                # Nhật ký theo dõi súc tích các phiên bản thay đổi
├── src/
│   ├── components/                 # Các Module Giao diện thành phần rời rạc
│   ├── lib/
│   │   └── api.ts                  # Module trung gian kết nối RESTful Clients tự động kèm Auth Headers (S1, S2, S3 APIs)
│   ├── server/                     # Kiến trúc Máy chủ Backend Full-Stack
│   │   ├── auth.ts                 # Controller xử lý Đăng nhập & Đăng ký (S1-03, S1-04)
│   │   ├── budgets.ts              # Controller lưu mới thiết lập ngân sách (S2)
│   │   ├── db.ts                   # Trình quản lý hệ thống File-based DB (JSON) 
│   │   ├── expenses.ts             # RESTful API chuyên biệt CRUD chi tiêu (S1)
│   │   └── reports.ts              # Xử lý báo cáo logic (S3) kết hợp xuất tài liệu chuẩn hóa
│   ├── types.ts                    # Khai báo kiểu thực thể (Entity Models) chặt chẽ
│   ├── mockData.ts                 # Dữ liệu khởi tạo đa dạng cho offline demo
│   ├── App.tsx                     # Bộ điều phối trạng thái gốc, Tích hợp Fetch API trực tuyến
│   ├── main.tsx                    # Điểm mồi khởi chạy của thư viện React
│   └── index.css                   # Định nghĩa CSS toàn cục tích hợp Tailwind v4
├── server.ts                       # Entry point Express Fullstack App kết hợp Vite Middleware. Middleware chạy cổng 3000 đa tuyến
├── package.json                    # Khai báo thư viện phụ thuộc và kịch bản lệnh dev, build đa máy chủ
```

---

### 3. Luồng Quản lý Trạng thái & Dữ liệu (State Management & Data Flow)

Ứng dụng áp dụng mô hình **Quản lý trạng thái tập trung tại một nguồn sự thật (Single Source of Truth)** tại file đầu não `App.tsx`:

1.  **Khởi động ứng dụng (Initialization Boot):**
    *   Hệ thống kiểm tra xem có trạng thái người dùng trong `LocalStorage` hay chưa.
    *   Nếu chưa, chuyển người dùng đến màn hình **Onboarding/Login** (`LoginRegister.tsx`) để điền tên, trường đại học, hạn mức thu nhập và chỉ tiêu tiết kiệm.
    *   Nếu có rồi, tự động tải danh sách chi tiêu, ngân sách hiện hành gán sẵn từ LocalStorage kết hợp dữ liệu giả lập phong phú từ `mockData.ts`.
2.  **Tính toán chỉ số thông minh (Reactives Derivations):**
    *   Mỗi khi danh sách chi tiêu (`expenses`) hoặc cấu hình ngân sách thay đổi, `App.tsx` tự động chạy bộ hàm tính toán phái sinh để cho ra thông số Dashboard cực kỳ chính xác hằng tháng, tránh việc lưu trữ trạng thái trùng lặp dễ dẫn đến mất đồng bộ dữ liệu.
3.  **Tác vụ phụ trợ & Đồng bộ tự động (Side Effects Synchronization):**
    *   Một con `useEffect` giám sát thay đổi sâu sắc của người dùng, giao dịch và cảnh báo để ghi đè cập nhật vào `LocalStorage` của thiết bị một cách mượt mà độc lập.

---

### 4. Giải pháp Thiết kế Tương thích Di động Vượt trội (Mobile Responsiveness Solutions)

Trong bản cập nhật mới nhất, chúng tôi đã giải quyết dứt điểm lỗi **"Ô nhập chi tiêu quá to gây khuất nút lưu trên di động"** thông qua các tối ưu hóa kiến trúc CSS sắc sảo:

*   **Tính năng Cuộn Có Điều kiện (Responsive Max-Height with Flex-Col):**
    *   Thay vì để một Modal có kích thước tĩnh gây tràn đáy màn hình, container Modal được gán lớp `max-h-[92vh] flex flex-col`.
    *   Phần nội dung nhập dữ liệu của Form được cấu hình riêng biệt với lớp `overflow-y-auto flex-1`. Toàn bộ nội dung biểu mẫu sẽ tự động sinh thanh cuộn mượt mà nội bộ nếu chiều cao màn hình vật lý của điện thoại quá nhỏ (ví dụ khi xoay ngang điện thoại hoặc trên thiết bị iPhone đời cũ).
*   **Thu hẹp Padding Thích ứng (`p-4 sm:p-6`):**
    *   Trên di động, các khoảng đệm thưa thừa được lược bỏ bớt giúp tăng tối đa diện tích hiển thị hữu ích, các nút lựa chọn phân loại "Needs vs Wants" được chuyển đổi cấu trúc grid một cột dọc nhịp nhàng hoặc thu gọn văn bản giải thích.
*   **Bảo vệ Trải nghiệm Nhập dữ liệu di động:**
    *   Bảo đảm nút "Lưu chi tiêu" luôn bám sát ở đáy màn hình hoặc cuộn mượt mà hiển hiện rõ ràng, loại bỏ lỗi gián đoạn trải nghiệm người dùng lúc nhập dòng tiền.
