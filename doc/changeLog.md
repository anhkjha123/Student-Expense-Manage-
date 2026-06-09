# NHẬT KÝ THAY ĐỔI (CHANGELOG)
## Student Expense Manager (Quản lý Chi tiêu Sinh viên)

Toàn bộ các mốc cập nhật và cải tiến kỹ thuật quan trọng của sản phẩm được ghi nhận chi tiết tại đây.

---

### [v4.0.0] - 2026-06-09
#### 🌟 Tính năng mới Sprint 4 (Savings, Incomes, Calendar & Recurring)
*   **Mục tiêu tiết kiệm (Saving Goals):** 
    *   Theo dõi tiến độ tiết kiệm real-time dựa trên số dư ví thực tế.
    *   Tự động tính phần trăm hoàn thành và đổi màu sắc cảnh báo theo thời hạn chót (Deadline).
*   **Quản lý thu nhập (Incomes):**
    *   Thêm tab quản lý dòng tiền vào (Incomes) với các nguồn như học bổng, làm thêm, gia đình chu cấp.
    *   Tích hợp bộ lọc theo tháng và biểu đồ tỷ lệ cơ cấu nguồn thu.
*   **Lịch chi tiêu (Calendar View):**
    *   Bảng lịch trực quan đổi màu theo mức độ chi tiêu của từng ngày (Xanh < 100k, Vàng < 500k, Đỏ > 500k).
    *   Hỗ trợ bấm chọn ngày để kiểm tra danh sách chi tiết các giao dịch tương ứng.
*   **Chi tiêu định kỳ & Nhập chi tiêu lặp lại (Recurring Expenses):**
    *   Thêm tab cấu hình các khoản chi cố định hàng tuần/tháng (như tiền nhà, mạng internet).
    *   **Dropdown định kỳ trong biểu mẫu nhập nhanh:** Cung cấp hộp chọn "Chi tiêu định kỳ (Lặp lại)" (Không lặp lại, Lặp lại hàng tuần, Lặp lại hàng tháng) ngay tại `AddExpenseModal` khi tạo khoản chi mới. Khi lưu, hệ thống tự động ghi nhận giao dịch hiện tại đồng thời thiết lập mẫu chi tiêu định kỳ tương ứng để tự động sinh hóa đơn trong tương lai.
    *   **Tái cấu trúc điều hướng (Navigation Dropdown & Mobile Toggle):** Loại bỏ tab "Định Kỳ" độc lập khỏi thanh điều hướng chính. Trên desktop, khi hover qua tab "Sổ Chi Tiêu" sẽ hiển thị dropdown chứa hai tùy chọn: "Lịch sử chi tiêu" và "Chi tiêu định kỳ". Trên mobile, tab "Sổ Chi Tiêu" tự động đóng vai trò nút bấm chuyển đổi động (toggle) giữa hai chế độ "Sổ chi tiêu" và "Định kỳ", tối ưu hóa tuyệt đối không gian hiển thị.
*   **🔧 Sửa lỗi nút lưu Thu nhập & Tiết kiệm (Save Buttons Fix):**
    *   **Khắc phục lỗi xác thực token (Auth token fix):** Bổ sung trích xuất ID người dùng linh hoạt (`decoded.user_id || decoded.sub`) trong `authMiddleware` tại backend server Express, giúp giải mã chính xác token ID Firebase khi đăng nhập bằng Google/Email.
    *   **Khởi tạo token offline cho Chế độ khách:** Tự động gán token cục bộ `'demo_offline_token_xyz'` khi người dùng trải nghiệm Chế độ Khách (Offline), đảm bảo mọi cuộc gọi API thử nghiệm tới backend được phê duyệt hợp lệ.
    *   **Cơ chế lưu trữ ngoại tuyến dự phòng (LocalStorage Fallback):** Bổ sung logic lưu trữ và nạp dữ liệu cục bộ vào LocalStorage dự phòng cho `SavingGoals.tsx` và `Incomes.tsx`. Nếu kết nối mạng đứt hoặc Express API trả lỗi, các nút lưu vẫn ghi nhận hoạt động bình thường trên trình duyệt của người dùng.

---

### [v3.2.0] - 2026-06-07
#### ✍️ Bổ sung Tính năng Chỉnh sửa Chi tiêu (Edit Expense Support)
*   **Chỉnh sửa đa điểm (Multi-entry Point Editing):**
    *   Cung cấp biểu tượng cây bút chì (Edit button) trực tiếp tại cả hai màn hình: Màn hình chính Dashboard (Danh sách giao dịch gần đây) và Sổ chép chi tiêu (Bảng thống kê lịch sử toàn diện).
    *   Nhấp vào nút sửa sẽ kích hoạt phương thức nạp dữ liệu cũ vào biểu mẫu `AddExpenseModal` thông minh, tự động đổi danh mục, lượng tiền, phân loại và ngày tháng.
    *   Modal chỉnh sửa tự động thay đổi tiêu đề ("Chỉnh sửa khoản chi tiêu") và thay thế nhãn hành động thành "Lưu thay đổi", bảo đảm giao tiếp trực quan.
*   **Đồng cập nhật Thời gian thực & Ngân sách (Real-time Budget Recalculation):**
    *   Khi có bất kỳ hành động sửa đổi chi dùng nào, điểm số ví, biểu đồ tiến trình Needs/Wants và hạn mức ngân sách tháng tương ứng lập tức tự động tính toán lại mà không cần tải lại trang.
    *   Thừa hưởng hoàn toàn cơ chế Đua thời gian (Race timeout 1.5s) và đồng bộ offline mạnh mẽ giúp giữ an toàn dữ liệu trên Firestore.

---

### [v3.1.0] - 2026-06-05
#### 🔌 Khả năng Kháng Đứt Mạng (Offline Resiliency) & Sửa lỗi Cảnh báo Ngân sách
*   **Chế độ Ngoại tuyến & Đua thời gian (Offline Resiliency & Race Timeout):** 
    *   Bọc tất cả các yêu cầu gọi API từ xa vào một cơ chế đua thời gian (Race timeout từ 1.5s - 2.5s) hoặc kiểm tra trạng thái thiết bị ngoại tuyến chủ động `navigator.onLine`. 
    *   Khi mất mạng đột ngột hoặc mạng lag/unstable, ứng dụng sẽ ngay lập tức chuyển sang chế độ lưu trữ và cập nhật hiển thị tương tác offline lên trang chính qua `localStorage` cục bộ, loại bỏ hoàn toàn hiện tượng treo hay nghẽn UI khi nhấn nút lưu chi tiêu.
    *   Khi mạng khôi phục thành công, toàn bộ giao dịch mới tạo offline sẽ tự động đồng bộ ngầm lên Firestore với cơ chế đối chiếu thông tin sâu (Duplication/Shadow records guard) giữ an toàn dữ liệu, chống ghi lặp hóa đơn.
*   **Khắc phục Cảnh báo Sai lệch Ngân sách (Budget False Alarm Fixed):**
    *   Xử lý dứt điểm "Báo động đỏ" cảnh báo tràn ngân sách luôn hiển thị không đúng lúc người dùng mới đăng nhập hoặc chưa kịp cấu hình xong thu nhập của chu kỳ tháng.
    *   Thay thế bằng một thông báo hướng dẫn dịu dàng (⚙️ Chưa cấu hình đầy đủ tài chính tháng này) để hướng dẫn sinh viên sang tab "Cấu hình" nhằm kích hoạt tính năng đo lường sức khỏe tài chính.

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
