# NHẬT KÝ THAY ĐỔI (CHANGELOG)
## Student Expense Manager (Quản lý Chi tiêu Sinh viên)

Toàn bộ các mốc cập nhật và cải tiến kỹ thuật quan trọng của sản phẩm được ghi nhận chi tiết tại đây.

---

### [v3.0.0] - 2026-06-05
#### 🔥 Chuyển đổi Cơ sở dữ liệu Cloud (Firebase Integration)
*   **Chuyển đổi từ JSON Database sang Firebase:** Khắc phục triệt để rủi ro mất dữ liệu và thiếu đồng bộ đa thiết bị của phiên bản trước (sử dụng file `data/db.json` local). Hệ thống nay được trang bị **Firebase Firestore**, cho phép:
    *   Đồng bộ dữ liệu thời gian thực (Real-time sync) trên mọi thiết bị máy tính và điện thoại.
    *   Hỗ trợ chế độ Offline (Offline Persistence) bẩm sinh của Firestore dành cho môi trường sóng yếu.
*   **Bảo mật:** Triển khai quy tắc bảo mật `firestore.rules` cực kỳ nghiêm ngặt, chỉ cho phép người dùng đã xác thực (Firebase Auth) đọc/ghi biên lai chi tiêu của chính họ.
*   **Chuẩn hoá Dữ liệu:** Khởi tạo `firebase-blueprint.json` xác định schema chặt chẽ cho Profile, Expense, Budget và Notification.

---

### [v2.1.0] - 2026-06-04
#### 🌟 Nâng cấp Trải nghiệm Người dùng (UX & Animations)
*   **Hoạt ảnh & Tương tác (Framer Motion):** Tích hợp thư viện `motion/react` vào các Dashboard Cards, danh sách chi tiêu và Add Expense Modal. 
    *   Tạo hiệu ứng xuất hiện xếp tầng (staggerChildren) siêu mượt cho giao diện chính.
    *   Thêm phản hồi nảy nhẹ (Spring bounce), hiệu ứng Scale và di chuyển khi Hover chuột vào các khối thẻ chức năng.
*   **Hiệu ứng thị giác (Drop Shadows & Depth):** Thêm độ sâu cho ứng dụng thông qua viền bóng mềm (drop-shadow, hover:shadow-lg) của Tailwind. Các icon, văn bản nổi bật và thẻ báo cáo tài chính tạo cảm giác 3D (Depth) cực kì hiện đại.
*   **Minh bạch Tuân thủ Quy trình (Vibe Coding):** Khởi tạo tài liệu `/doc/vibe-code-proof.md` chứng minh việc lên kế hoạch (Plan), thiết kế tài liệu (Doc), xây dựng (Build), kiểm thử tự động (Test) chuẩn hóa trước khi đẩy (Ship) ứng dụng ra môi trường Production.

---

### [v2.0.0] - 2026-06-04
#### 🌟 Kiến trúc Máy chủ Full-Stack & Bảo mật API (Backend Migration)
*   Chuyển đổi ứng dụng từ mô hình Client-side (SPA) sang kiến trúc **Full-stack Client-Server** chuyên nghiệp:
    *   Sử dụng **Node.js, Express** ở backend và đính kèm bộ dịch Vite Middleware cho môi trường phát triển (Development).
    *   Biên dịch và đóng gói (Bundle) backend server chuyên biệt qua `esbuild` giảm thiểu gián đoạn module CommonJS tại Production.
*   Thiết lập hệ thống xác thực người dùng (**JWT Authentication**), loại bỏ hoàn toàn cơ chế định danh mô phỏng giả lập (Mocking) trên Client.
*   Di dời toàn bộ logic quản lý, lưu trữ từ LocalStorage của Trình duyệt xuống hệ thống File-based Database Server-side an toàn (`data/db.json`). Các module Controller (S1, S2, S3 APIs) phản hồi JSON độc lập.
*   Hoàn thiện luồng Fetch API thay vì đọc ghi file tĩnh. Vẫn bao hàm cơ chế **Offline-fallback (Demo Mode)** mạnh mẽ từ `LocalStorage` và tài khoản thử nghiệm "sinhvien@hust.edu.vn" để tăng cường độ tương thích khi Backend sập/chưa sẵn sàng.

#### 🖨️ Xuất Báo cáo Tài chính Độc lập (PDF/Excel)
*   Thực thi S3-15: Chức năng tạo biên lai chi tiêu/ Báo cáo PDF Render trực tiếp qua HTML tại phía máy chủ Express, hỗ trợ đầy đủ Font và Encoding chuẩn. Trích xuất theo từng tháng bằng URL tham số token.
*   Thực thi S3-16: Xuất file bảng tính Excel dạng CSV (`BOM UTF-8`) kháng triệt để lỗi Font chữ tiếng Việt khi xem trong Excel.
*   Tái thiết kế thanh điều hướng Navbar (Adaptive Layouts) loại bỏ lỗi hiển thị chèn lấp nhau trên giao diện di động.

#### 🎨 Tối ưu Giao diện Máy tính bảng & Đồng bộ Thời gian thực (Real-time Date)
*   **Giao diện Tablet (Responsive Layout):** Tái cấu trúc bộ khung lưới hiển thị (Grid) tại Dashboard bằng break-points `md:grid-cols-12`, giúp các khối thẻ thông tin và biểu đồ hiển thị cân đối, tận dụng tuyệt đối không gian trên màn hình máy tính bảng (Tablet/iPad).
*   **Đồng bộ thời gian thực (Real-time Sync):** Thay thế toàn bộ các biến thời gian cấu hình tĩnh (như 01/06/2026) bằng hệ thống ngày giờ động (Dynamic System Time).
    *   Thanh điều hướng, Báo cáo và Dashboard tự động nhảy sang ngày/tháng mới theo giờ thực tế.
    *   Form thêm khoản chi mặc định trỏ về hiện tại thay vì lịch sử (metadata).
    *   Máy tính an toàn ví tự đồng bộ tỷ lệ chi tiêu theo đúng mốc thời gian hiện thời trong tháng.

---

### [v1.1.0] - 2026-06-03
#### 🌟 Tính năng mới & Tái cấu trúc (Restructuring)
*   Thực hiện đồng bộ hóa và cấu trúc hóa toàn diện thư mục dự án theo cấu trúc **projectmodel** tiêu chuẩn chuyên nghiệp.
*   Thiết lập hệ thống tài liệu đi kèm chuyên sâu:
    *   `/doc/spec.md`: Tài liệu đặc tả kỹ thuật sản phẩm (SRS).
    *   `/doc/Architecture.md`: Tài liệu giải trình thiết kế và sơ đồ kiến trúc dữ liệu (ADR).
    *   `/doc/changeLog.md`: Nhật ký thay đổi phần mềm (File này).
    *   `/README.md`: Tài liệu hướng dẫn thiết lập dự án ở thư mục gốc.
    *   `/env.example`: Bản mẫu cấu hình biến môi trường an toàn.

#### 🔧 Sửa lỗi (Bug Fixes)
*   **Dứt điểm lỗi tràn viền và lỗi lưu dữ liệu trên di động:**
    *   Khắc phục lỗi ô nhập chi tiêu của `AddExpenseModal.tsx` quá lớn so với tỉ lệ màn hình điện thoại dẫn đến việc khuất nút **"Lưu chi tiêu"**, người dùng không thể thấy hoặc nhấp nút lưu.
    *   **Nâng cấp:** Chuyển giao diện Modal sang dạng `flex-col` có giới hạn `max-h-[92vh]`. Tạo thanh cuộn nội bộ (`overflow-y-auto`) cho phần biểu mẫu nhập liệu.
    *   **Tùy biến khoảng cách:** Thu hẹp khoảng cách `p-4 sm:p-6` và co giãn các khối nhập tiền tệ, phân loại Needs/Wants để tối ưu hóa không gian hiển thị trên các màn hình nhỏ như iPhone SE/X, bảo đảm trải nghiệm tiện lợi và mượt mà nhất cho sinh viên dùng điện thoại.

#### 🧪 Hệ thống Kiểm thử (Testing Suite)
*   Tích hợp bộ công cụ kiểm thử tự động **Vitest** hỗ trợ thực hiện viết các ca kiểm thử đơn vị cho chức năng tính toán tài chính của ứng dụng.
*   Cài đặt cấu hình script lệnh `npm run test` phục vụ việc kiểm hoạt động của logic hằng ngày.

---

### [v1.0.0] - 2026-06-01
#### 🎉 Khởi tạo Dự án (Initial Release)
*   Phát triển thành công bộ khung ứng dụng quản lý tài chính sinh viên giao diện tinh tế bằng React 19, TypeScript và Tailwind CSS v4.
*   Xây dựng hệ thống Onboarding phân loại sinh viên theo các trường đại học cụ thể kết hợp thiết lập thu nhập đầu chu kỳ.
*   Hỗ trợ quản lý dòng tiền chi tiêu theo 7 danh mục thiết yếu bậc nhất của cuộc sống sinh sinh học đường.
*   Thiết kế biểu đồ tròn phân tích cơ cấu tiêu dùng D3 trực quan kết hợp thống kê phân nhóm quy tắc tài chính 50/30/20 đơn giản hóa.
*   Tính toán dự báo tích lũy cuối chu kỳ giúp sinh viên nắm thế chủ động dòng tiền.
*   Hệ thống cảnh báo tự động thông báo realtime khi sắp cạn hoặc lỡ lạm phát chi tiêu.
*   Lưu trữ dữ liệu an toàn cục bộ LocalStorage.
