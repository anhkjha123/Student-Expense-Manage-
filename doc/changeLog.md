# NHẬT KÝ THAY ĐỔI (CHANGELOG)
## Student Expense Manager (Quản lý Chi tiêu Sinh viên)

Toàn bộ các mốc cập nhật và cải tiến kỹ thuật quan trọng của sản phẩm được ghi nhận chi tiết tại đây.

---

### [v1.1.0] - 2026-06-03
#### 🌟 Tính năng mới & Tái cấu trúc (Restructuring)
*   Thực hiện đồng bộ hóa và cấu trúc hóa toàn diện thư mục dự án theo cấu trúc **projectmodel** tiêu chuẩn chuyên nghiệp.
*   Thiết lập hệ thống tài liệu đi kèm chuyên sâu:
    *   `/doc/spec.md`: Tài liệu đặc tả kỹ thuật sản phẩm (SRS).
    *   `/doc/Architecture.md`: Tài liệu giải trình thiết kế và sơ đồ kiến trúc dữ liệu (ADR).
    *   `/doc/changeLog.md`: Nhật ký thay đổi phần mềm (File này).
    *   `/readme.md`: Tài liệu hướng dẫn thiết lập dự án ở thư mục gốc.
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
