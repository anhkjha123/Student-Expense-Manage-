# Student Expense Manager (SemTietKiem) 🎓💳
Ứng dụng full-stack (React + Express) tinh gọn và mạnh mẽ giúp sinh viên dễ dàng ghi chép chi tiêu trong vòng dưới 10 giây, phân bổ dòng tiền thông minh theo mô hình Cần thiết vs Mong muốn (Needs/Wants) và đề phòng lạm phát cháy túi cuối tháng.

Tích hợp tính năng Đồng bộ Thời gian thực (Real-time Sync): Thời gian trong ứng dụng sẽ luôn đi cùng với thời gian thực trên lịch sinh viên. Mỗi khi thêm một khoản chi, các chỉ số an toàn ví điện tử, quỹ ngân sách linh hoạt và các báo cáo sẽ được cập nhật ngay lập tức mà không cần tải lại trang.

✨ Tính năng chính
Nhập Chi Tiêu Siêu Tốc (Fast Entry): Form nhập chi tiêu trực quan, phân định danh mục rõ ràng, tự động định dạng số tiền VND thời gian thực, các hiệu ứng hoạt ảnh xuất hiện của thông báo bằng Framer Motion (motion).
Giám sát tốc độ Đồng bộ (Live Sync): Sử dụng API đồng bộ hóa lưu trữ cấu hình trên server, giúp màn hình Dashboard tự động cập nhật tốc độ chi tiêu tức thời mà không làm ảnh hưởng hay ngắt quãng trải nghiệm nhập liệu.
Hỗ trợ Chỉ số An toàn Ví nổi bật: Tự động nhận diện thiết lập hạn mức và tô điểm màu sắc cảnh báo đỏ, vàng, xanh theo quy chuẩn của tình trạng tài chính thiết yếu.
Báo Cáo Tài Chính Chuyên Trách: Đóng gói hoàn chỉnh thành một công cụ trích xuất PDF hoặc file Excel CSV chuyên nghiệp giúp sinh viên quản lý tài chính chuẩn mực mà không cần cấu hình phức tạp.

🛠️ Hướng dẫn cài đặt & Chạy ứng dụng
Yêu cầu máy tính của bạn đã cài đặt sẵn Node.js LTS (phiên bản khuyến nghị v18 trở lên).

1. Cài đặt các gói phụ thuộc
Giải nén mã nguồn, mở Terminal hoặc Command Prompt tại thư mục dự án và chạy:

```bash
npm install
```

2. Chạy ứng dụng chế độ Phát triển (Development)
Khởi chạy cả backend và frontend (Vite) đồng thời để chỉnh sửa mã nguồn:

```bash
npm run dev
```

Sau đó truy cập địa chỉ điều khiển: http://localhost:3000 trên trình duyệt web.

3. Xem trước ứng dụng trên giao diện Sản phẩm (Production)
Kiểm tra hoạt động của app dưới dạng phần mềm máy chủ:

```bash
npm run build
npm start
```

📦 Hướng dẫn đóng gói ứng dụng React & Node.js
Để biên dịch toàn bộ dự án thành trọn vẹn bản phát hành Production, hãy thực hiện:

Lệnh đóng gói tự động:
```bash
npm run build
```

Lưu ý: Quy trình này tự động chạy:
Biên dịch client-side của React thành các tập tin tĩnh trong `/dist`.
Bundles `server.ts` thành `/dist/server.cjs` thông qua phần mềm siêu tốc esbuild.
Khởi tạo File Engine cơ sở dữ liệu để ghi nhận nội dung vào `data/db.json` ổn định bên trong hệ thống.

Sản phẩm thu được:
Sau khi build hoàn tất, bạn sẽ nhận được mã nguồn chạy máy chủ hoàn chỉnh với Backend và Frontend hòa làm một nền tảng trên Express JS.

🌐 Cách sử dụng & Thiết lập ban đầu
1. Bật ứng dụng lên (hoặc chạy app qua dòng lệnh `npm run dev`).
2. Nhập email, Tên trường Đại học và Khoản chu cấp hằng tháng của bạn.
3. Bấm Đăng nhập / Bắt đầu trải nghiệm.
4. Chuyển sang thẻ Danh mục thiết lập (Ngân sách) để căn chỉnh hạn mức tiền trọ, ăn uống theo layout chi tiêu của bạn.
5. Nhấn nút màu Trắng (Thêm một khoản chi) để tạo lịch sử tiêu dùng.
6. Nhấn vào phần Báo cáo -> Chọn xuất File PDF/Excel. 
Mỗi khi bạn sửa ngân sách hoặc thêm khoản chi tiêu bằng Dashboard của app, chỉ cần quay về giao diện chính của bảng điều khiển. Các thanh progress và phần trăm sẽ cập nhật trực tiếp sau 1 giây!

📂 Các cổng kết nối & Thiết lập
Mặc định ứng dụng chạy trên cổng kết nối nội bộ: 3000.
Nếu chia sẻ web cho điện thoại của mình ở mạng nội bộ, hãy thay localhost bằng địa chỉ IP máy tính nội mạng của bạn (Ví dụ: http://192.168.1.5:3000/sem-tiet-kiem).
