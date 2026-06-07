# TẢI LIỆU YÊU CẦU SẢN PHẨM (SPEC.MD)
## Student Expense Manager (Quản lý Chi tiêu Sinh viên Full-Stack)

### 1. Giới thiệu Dự án
Student Expense Manager là một ứng dụng web cấp tiến, gọn nhẹ và tối ưu hóa tối đa cho đối tượng sinh viên đại học/cao đẳng tại Việt Nam. Mục tiêu của ứng dụng là giải quyết triệt để vấn đề "cháy túi cuối tháng" thông qua phương pháp phân bổ ngân sách thông minh (mô hình Needs/Wants), cung cấp hệ thống cảnh báo tức thời khi chi tiêu vượt hạn mức và quản lý dòng tiền bằng kiến trúc Full-Stack.

*   **Tên Dự án:** Student Expense Manager (SemTietKiem)
*   **Mục tiêu Trọng tâm:** Đơn giản hóa việc ghi chép dòng tiền dưới 10 giây, tính toán ngân sách tối ưu, hệ thống Full-stack (bảo mật, hỗ trợ offline-fallback) và xuất báo cáo chất lượng cao.
*   **Ngôn ngữ Kỹ thuật:** React 19, TypeScript, Express, Node.js, Tailwind CSS v4, Framer Motion.

---

### 2. Mô tả Đối tượng Người dùng & Nỗi đau (User Persona)
#### 2.1 Đối tượng Người dùng Mục tiêu
*   Sinh viên sống xa nhà, nhận trợ cấp từ gia đình theo tháng hoặc có thêm thu nhập từ các việc part-time.
*   Cần tự chủ chi tiêu: phòng trọ, giáo trình, ăn uống, di chuyển, giao lưu bạn bè.

#### 2.2 Nỗi đau của Sinh viên (Pain Points)
1.  **Thiếu kỷ luật ghi chép:** Các công cụ Excel hay ứng dụng tài chính lớn thường quá rườm rà.
2.  **Mơ hồ giữa "Cần" và "Muốn":** Lạm chi vào các cuộc trà sữa, mua sắm quần áo thời trang mà bỏ quên chi phí thiết yếu.
3.  **Hội chứng "Viêm màng túi":** Không nắm rõ số dư tài chính đầu cuối, tốc độ chi tiêu so với số ngày còn lại trong tháng.

---

### 3. Các Tính năng Cốt lõi của Hệ thống (Core Features)

#### 3.1 Dịch vụ Báo cáo & Phân tích (Reports & Exports)
*   **Trích xuất Tài liệu (S3 Logic):** Khả năng dựng biên lai tài chính định dạng PDF (sử dụng thư viện Express HTML Render) hoặc xuất file tính biểu đồ Excel CSV đa nền tảng (có chữ kí BOM chống lỗi tiếng Việt).
*   **Đồng bộ Thời gian thực (Real-time Date Sync):** Các chức năng lọc hệ thống báo cáo và Dashboard luôn bám sát lịch thời gian trôi của môi trường thật.

#### 3.2 Nhập Chi tiêu Nhanh & Tương tác (Fast Entry & UX Animations)
*   **Hoạt họa giao diện (Vibe UX):** Biểu mẫu sử dụng `framer-motion` cho trải nghiệm sinh động. Drop-shadow và hover-scale logic làm bật lên chiều sâu các Dashboard Card tương tác.
*   **Giao diện Modal Tương thích Di động tối đa:**
    *   Hỗ trợ định dạng VND thông minh phân tách hàng nghìn (1.000.000).
    *   Cơ chế chống đẩy tràn bàn phím tại khung Viewport di động.

#### 3.3 Bảng điều khiển Đa chiều (Interactive Dashboard)
*   **Chỉ số An toàn Ví sinh viên:** Biểu đồ đo tiến trình (Gauge) chấm điểm tốc độ chi tiêu trên số ngày khả dụng, cảnh báo nếu tốc độ tiêu tiền đang nhanh hơn mức cho phép.
*   **Biểu đồ Cấu trúc Needs/Wants:** Minh họa thanh tiến trình 50/30/20. Cảnh báo thông minh khi tỷ lệ giải trí vượt quá mức trần.
*   **Bộ Lọc Cảnh báo Thông minh (Smart Setup Warning):** Tránh các cảnh báo vô nghĩa. Chỉ số trạng thái Báo Động Đỏ vỡ ngân sách chỉ kích hoạt khi người dùng đã cấu hình đầy đủ thu nhập tháng. Đối với tài khoản trống, hệ thống hiển thị hướng dẫn người dùng thiết lập ngân sách ban đầu linh hoạt.

#### 3.4 Backend Security & Hạn mức (API Control)
*   **Cơ chế xác thực JWT Auth:** Đăng nhập hệ thống bảo vệ thông qua server Express. 
*   **Database Lưu trữ & Kháng đứt mạng tối tân (Cloud Firestore + Cache Resilience):**
    *   Học tập từ mô hình Mobile-First Offline, thiết lập kiểm chứng mạng thời gian thực qua `navigator.onLine` kết hợp cơ chế Đua thời gian (Race timeout 1500ms - 2500ms) để không gây đứng UI khi kết nối chập chờn.
    *   Hỗ trợ lưu trữ tạm thời giao dịch & ngân sách tự động vào `localStorage` cục bộ khi mất mạng và đồng bộ ngầm khi kết nối phục hồi.
    *   Sở hữu thuật toán đối chiếu dữ liệu (Duplication Protection Guard) để chống lại hiện tượng ghi lặp (duplicate items) do trùng lặp gói tin mạng kém ổn định.
*   **Thông báo Vượt hạn mức:** Cảnh báo đỏ tại giao diện khi mục tiêu chi tiêu bị vượt ngưỡng 90%.

---

### 4. Yêu cầu Phi chức năng (Non-Functional Requirements)
*   **Kiến trúc:** Triển khai độc lập với Vite middleware Development và esbuild (CJS) tại vòng Production.
*   **Responsiveness Grid:** Thay đổi thiết kế linh hoạt bằng Grid break-points `md:grid-cols-12`, bảo đảm bố cục đẹp xuất sắc trên màn hình Tablet/Ipad.
*   **Testing chuẩn chỉnh:** Mọi function tính toán đều thông qua trình Test Vitest và `npm run lint`.
