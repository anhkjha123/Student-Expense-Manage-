Student Expense Manager (SemTietKiem) 🎓💳
Ứng dụng full-stack (React + Express) tinh gọn và mạnh mẽ giúp sinh viên dễ dàng ghi chép chi tiêu trong vòng dưới 10 giây, phân bổ dòng tiền thông minh theo mô hình Cần thiết vs Mong muốn (Needs/Wants) và đề phòng lạm phát cháy túi cuối tháng.

Tích hợp tính năng Đồng bộ Thời gian thực (Real-time Sync): Thời gian trong ứng dụng sẽ luôn đi cùng với thời gian thực trên lịch để đảm bảo báo cáo, quỹ ngân sách và dự báo tương lai được lập trình chính xác nhất. Ngay cả giao diện trên máy tính bảng (Tablet) hay điện thoại cũng tự động tái thiết kế không gian linh hoạt mà không làm giảm trải nghiệm.

✨ Tính năng chính
Nhập Chi Tiêu Siêu Tốc: Form nhập chi tiêu trực quan, phân định danh mục rõ ràng, tự động định dạng số tiền VND thời gian thực, chống tràn màn hình trên mọi thiết bị di động.
Kiểm soát Ngân Sách Điểm Ruồi (Budget Radar): Cảnh báo đỏ tức thời ngay khi một danh mục chi tiêu chạm ngưỡng 80% hoặc 100% giới hạn ngân sách tự đề ra hằng tháng.
Dự Báo & Chỉ Số An Toàn Ví: Mô phỏng số tiền tích lũy thực tế dựa trên tốc độ và xu hướng tiêu xài hiện tại, biểu diễn dưới dạng đồng hồ đo tốc độ sinh động.
Báo Cáo Tài Chính Chuyên Trách: Trích xuất báo cáo thu chi dưới dạng ấn phẩm PDF hoặc tải thẳng file Excel CSV cực kì chuyên nghiệp.
Kiến Trúc Máy Chủ Full-Stack Độc Lập: Sử dụng API đồng bộ hóa lưu trữ cấu hình trên Node.js server cùng mô hình Offline-fallback giúp app vẫn hoạt động nội bộ trên thiết bị dù mạng có mất.

🛠️ Hướng dẫn cài đặt & Chạy ứng dụng
Yêu cầu máy tính của bạn đã cài đặt sẵn Node.js (phiên bản khuyến nghị v18 trở lên).

1. Cài đặt các gói phụ thuộc
Mở Terminal hoặc Command Prompt tại thư mục dự án và chạy:
```bash
npm install
```

2. Chạy ứng dụng chế độ Phát triển (Development)
Khởi chạy cả backend và frontend đồng thời để chỉnh sửa mã nguồn:
```bash
npm run dev
```
Sau đó truy cập ứng dụng: `http://localhost:3000` trên trình duyệt web.

3. Triển khai Production & Khởi chạy trực tiếp đầu cuối
Kiểm tra hoạt động của app dưới dạng ứng dụng trọn vẹn:
```bash
npm run build
npm start
```

📦 Hướng dẫn đóng gói ứng dụng Node.js & React
Lệnh đóng gói tự động:
```bash
npm run build
```
Lưu ý: Quy trình này tự động chạy:
- Biên dịch client-side của React thành các tập tin tĩnh trong thư mục `/dist`.
- Bundles `server.ts` thành `/dist/server.cjs` thông qua phần mềm siêu tốc `esbuild` giảm thiểu gián đoạn module CommonJS.

🌐 Cách bắt đầu trải nghiệm (Cho Sinh viên)
1. Bật ứng dụng lên (hoặc chạy app qua dòng lệnh `npm run dev`).
2. Chọn màn hình Đăng ký / Trải nghiệm ngay bằng tài khoản trường Đại học mô phỏng của bạn. Bấm "Vào thẳng bằng Tài khoản Mẫu" nếu lười nhập liệu.
3. Thiết lập Chu cấp Đầu tháng & Số tiền Kì vọng tiết kiệm. Bấm Tham gia.
4. Chuyển sang thẻ Danh mục thiết lập trước các giới hạn ngân sách (như Tiền trọ, Đi lại).
5. Cuối tháng, nhấn qua Tab "Báo Cáo & Phân Tích" bấm chọn Nút Xuất Báo Cáo PDF !

📂 Các cổng kết nối & Thiết lập
Mặc định ứng dụng chạy cấu hình Máy chủ Express & Vite HMR tại cùng cổng kết nối nội bộ: **3000**.
Thư mục cơ sở dữ liệu `data/db.json` sẽ tự động phát sinh khi có giao dịch được thực hiện.
Kiểm thử Unit (Vitest) có thể được tiến hành trực tiếp thông qua lệnh `npm run test` và kiểm tra cú pháp `npm run lint`.
