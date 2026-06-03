# TẢI LIỆU YÊU CẦU SẢN PHẨM (SPEC.MD)
## Student Expense Manager - Ứng dụng Quản lý Chi tiêu Sinh viên

### 1. Giới thiệu Dự án
Student Expense Manager là một ứng dụng web cấp tiến, gọn nhẹ và tối ưu hóa tối đa cho đối tượng sinh viên đại học/cao đẳng tại Việt Nam. Mục tiêu của ứng dụng là giải quyết triệt để vấn đề "cháy túi cuối tháng" thông qua phương pháp phân bổ ngân sách thông minh (mô hình Needs/Wants - Chi tiêu Cần thiết vs Chi tiêu Mong muốn) và cung cấp hệ thống cảnh báo tức thời khi chi tiêu vượt hạn mức.

*   **Tên Dự án:** Student Expense Manager (Trình Quản lý Chi tiêu Sinh viên)
*   **Mục tiêu Trọng tâm:** Đơn giản hóa việc ghi chép dòng tiền dưới 10 giây, tính toán ngân sách tối ưu, và tự động cảnh báo bảo vệ mục tiêu tiết kiệm.
*   **Ngôn ngữ Phát triển:** React (v19), TypeScript, Tailwind CSS (v4).

---

### 2. Mô tả Đối tượng Người dùng & Nỗi đau (User Persona & Pain Points)
#### 2.1 Đối tượng Người dùng Mục tiêu
*   Sinh viên sống xa nhà, nhận trợ cấp từ gia đình theo tháng hoặc có thêm thu nhập từ các công việc làm thêm (part-time).
*   Có mức ngân sách giới hạn (thường từ 3,000,000đ - 6,000,000đ/tháng) và cần tự chủ tài chính cho nhiều danh mục phức tạp: phòng trọ, giáo trình, ăn uống, di chuyển, giao lưu bạn bè.

#### 2.2 Nỗi đau của Sinh viên (Pain Points)
1.  **Thiếu kỷ luật ghi chép:** Các công cụ Excel hay ứng dụng tài chính lớn thường quá rườm rà, tốn nhiều thời gian nhập số liệu khiến người dùng bỏ cuộc chỉ sau vài ngày.
2.  **Mơ hồ giữa "Cần" (Needs) và "Muốn" (Wants):** Dễ dàng lạm chi vào các cuộc trà sữa, mua sắm quần áo thời trang mà bỏ quên các chi phí thiết yếu như tiền sách vở, xăng xe hay điện nước.
3.  **Hội chứng "Viêm màng túi" cuối tháng:** Không nắm rõ quỹ tiền còn lại là bao nhiêu, dẫn đến việc tiêu xài thoải mái đầu tháng và phải ăn mì tôm, vay mượn cuối tháng.

---

### 3. Các Tính năng Cốt lõi của Hệ thống (Core Features)

#### 3.1 Đăng nhập & Cá nhân hóa Hồ sơ (Onboarding & Profile)
*   **Đăng nhập bằng Email & Tên trường đại học:** Tăng trải nghiệm nhập vai, tối ưu giao diện theo đặc thù của trường (Ví dụ: Đại Học Bách Khoa Hà Nội, Đại học Quốc gia...).
*   **Thiết lập Thu nhập & Mục tiêu Tiết kiệm hằng tháng:** Cho phép khai báo số tiền được cung cấp/kiếm thêm và số tiền mong muốn tiết kiệm. Hệ thống sẽ tự động tính toán tổng ngân sách khả dụng tối đa cho chi tiêu.

#### 3.2 Nhập Chi tiêu Nhanh trong 10 Giây (Fast Expense Entry)
*   **Giao diện Modal Tương thích Di động tối đa (Mobile-Friendly Fixed Scroll):**
    *   Hạn mức tiền tệ hiển thị định dạng VND phân tách hàng nghìn linh hoạt.
    *   Phân loại trực quan ngay khi nhập bằng cơ chế nút bấm nhạy bén: **Cần thiết (Needs)** hoặc **Mong muốn (Wants)**.
    *   Hỗ trợ cuộn mượt mà trên màn hình điện thoại siêu nhỏ, cam kết không bị tràn khung hay mất nút Lưu.
*   **Danh mục Chi tiết & Trực quan:** Tiền thuê phòng trọ, Ăn uống, Học tập, Di chuyển, Trà sữa/Giải trí, Mua sắm và Chi phí khác.

#### 3.3 Bảng điều khiển Đa chiều (Interactive Dashboard & Analytics)
*   **Chỉ số Tài chính Tổng quan (KPI Widget):**
    *   **Còn lại khả dụng:** `Thu nhập - Tiết kiệm mục tiêu - Tổng đã chi`.
    *   **Tổng chi tiêu lý thuyết vs Thực tế.**
    *   **Tỷ lệ quy tắc tài chính:** Tỷ trọng chi tiêu cho nhóm "Cần thiết" (đảm bảo cấu trúc tài chính lành mạnh).
    *   **Dự báo Tài chính Cuối tháng:** Ước tính số tiền tiết kiệm thực tế cuối tháng dựa trên tốc độ tiêu dùng hiện tại.
*   **Biểu đồ Phân bổ D trực quan:** Trực quan hóa phần trăm chi tiêu theo từng danh mục dịch vụ học tập sinh hoạt để dễ dàng phát hiện "lỗ hổng" rò rỉ tiền tệ.

#### 3.4 Hạn mức Ngân sách & Cảnh báo (Budget Settings & Threshold Warning)
*   **Thiết lập hạn mức riêng biệt cho từng danh mục:** Ví dụ: Ăn uống tối đa 1.5 triệu/tháng, Giải trí tối đa 500k/tháng.
*   **Hệ thống thông báo Realtime (Notifications Engine):**
    *   Gửi thông báo thành công khi đạt tiến trình tiết kiệm hằng tuần.
    *   Tự động bắn cảnh báo đỏ (Warning Badge) khi một danh mục chi tiêu vượt ngưỡng 80% hoặc 100% hạn mức đã gán.
    *   Cảnh báo thông minh khi tỷ lệ "Mong muốn" (Wants) vượt quá 30% tổng chi tiêu hiện tại.

#### 3.5 Lịch sử & Bộ lọc Giao dịch (Transaction Ledger & Filtering)
*   **Bảng tra cứu lịch sử chi tiết:** Hiển thị mốc thời gian, tên chi tiêu, phân nhóm rõ ràng (màu xanh cho Cần thiết, màu cam cho Mong muốn).
*   **Bộ lọc nâng cao (Trình duyệt thông minh):** Phân chia theo Danh mục, trạng thái Thiết yếu (Needs) hay Giải trí (Wants), tìm kiếm nhanh theo từ khóa nội dung.

---

### 4. Yêu cầu Phi chức năng (Non-Functional Requirements)
*   **Thời gian phản hồi:** < 100ms cho mọi thao tác cập nhật dữ liệu (nhờ xử lý client-state tức thời và đồng bộ hóa ngầm LocalStorage).
*   **Khả năng tương thích di động (Responsiveness):** Thiết kế Grid co giãn linh hoạt từ điện thoại iPhone SE (320px) đến màn hình Ultra-wide (2560px). Tránh tuyệt đối việc cố định kích thước canvas hoặc modal gây tràn khung.
*   **Bảo mật dữ liệu:** Toàn bộ lịch sử chi tiêu lưu trữ khép kín trong LocalStorage của trình duyệt thiết bị người dùng, bảo đảm quyền riêng tư tuyệt đối về dữ liệu tài chính cá nhân.
