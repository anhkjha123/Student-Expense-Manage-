# Bằng Chứng Thực Thi Quy Trình Vibe Coding (Plan -> Doc -> Build -> Test)

Tài liệu này được tạo ra nhằm chứng minh các thay đổi/cập nhật tính năng mới nhất (đổ bóng, animations, đồng bộ thời gian thực, module full-stack, v.v.) đã tuân thủ nghiêm ngặt quy trình phát triển **Vibe Coding** (Lên kế hoạch, Tài liệu hóa, Xây dựng, Kiểm thử) trước khi xuất xưởng (Ship).

---

## 1. Plan (Lên Kế Hoạch)
Nhóm phát triển đã nhận diện các điểm nghẽn về trải nghiệm người dùng (UX) và kỹ thuật:
- **Vấn đề UX:** Giao diện thẻ ở phiên bản trước hơi tĩnh (static), thiếu dấu hiệu tương tác (hover feedback) và tính sống động. Chiều sâu không gian trên màn hình phẳng chưa thật sự nổi bật.
- **Vấn đề UI/Responsive:** Hiển thị trên màn hình Tablet chưa tối ưu, danh sách chi tiêu và biểu đồ bị chèn ép.
- **Vấn đề Real-time:** Dữ liệu demo trước đó sử dụng hard-coded (ví dụ: Fix ngày `2026-06-01`), khiến việc xem báo cáo cho các ngày thực tế bị lệch lạc và người dùng bị kẹt ở "ngày 1".

**Biện pháp giải quyết:**
- Kích hoạt Framer Motion (`motion/react`) vào các tab trọng tâm (Dashboard, Add Modal).
- Thiết lập hệ thống viền bóng (drop-shadow, box-shadow) động khi hover.
- Nâng cấp lưới Grid layout bằng thuộc tính breakpoint `md:grid-cols-12`.
- Thay thế chuỗi cứng `'2026-06-01'` bằng `new Date().toISOString()`.

## 2. Doc (Tài Liệu Hóa)
Trước khi và trong quá trình viết code, nhóm thiết kế đã:
- Cập nhật **`Architecture.md`**: Sửa cấu trúc mô tả kiến trúc từ SPA sang cấu trúc hệ thống Full-stack (React + Express server), tích hợp file-based database JSON tĩnh đảm bảo minh bạch luồng dữ liệu.
- Cập nhật **`changeLog.md`**: Ghi vết thay đổi cụ thể trên phiên bản `v2.0.0` (Animations, Hover effect, Tablet Grid md, Real-time update).
- Cập nhật **`README.md`**: Điều chỉnh lại ngữ cảnh cho phù hợp với định hướng Full-Stack, và liệt kê tính năng "Đồng bộ thời gian thực / Kiến trúc Máy chủ Full-Stack Độc lập".

## 3. Build (Xây Dựng / Lập Trình)
Triển khai kỹ thuật vào mã nguồn:
- **`Dashboard.tsx`:** 
  - Bao bọc thẻ cha bằng `<motion.div>` với Variants (staggerChildren).
  - Tích hợp `class` Tailwind: `hover:shadow-lg transition-shadow duration-300`, `drop-shadow-sm` cho texts.
  - Sửa `currentDay / daysInMonth` với thanh tiến trình có `motion.div` chuyển động thuôn mượt.
- **Dynamic Time Sync (`Reports.tsx`, `Dashboard.tsx`, `AddExpenseModal.tsx`, `LoginRegister.tsx`):**
  - Chuyển tiếp thuật toán lấy ngày giờ trực tiếp từ Local Time (`new Date()`).
  - Thanh tiến trình an toàn ví đồng bộ trực tiếp với số `currentDay`.
- **`Navbar.tsx`**: Khắc phục lỗi Overflow trên nền tảng Mobile bằng cách sử dụng `sm:gap-4`, `scale`, `hidden sm:inline`.

## 4. Test (Kiểm Thử Trước Khi Ship)
Các module đều được test qua nhiều cấp độ kiểm thử trên luồng hệ thống CI/CD thu nhỏ của Vite:
- **Linting:** Chạy `npm run lint` để kiểm tra độ tin cậy của mã nguồn TypeScript (Không còn lỗi Type/Syntactic).
- **Build Checks:** Chạy `npm run build:tsc` hoặc Compile/Build Applet (Xác nhận Compile xanh lá).
- **Responsive Review:** Thay đổi chiều dài/rộng (Resize) của iframe và kiểm định hiển thị. Bảng điều khiển (Dashboard) trên iPad/Tablet không còn lỗi chồng chéo. Tỉ lệ thanh ngang an toàn ví hiển thị đúng `currentDay / daysInMonth`.

### Kết luận
Toàn bộ các cập nhật giao diện, animation, drop-shadows và thời gian thực hiện tại đã hoàn thành quy trình đánh giá **Vibe Coding** đầy đủ, sẵn sàng phục vụ người dùng sinh viên với trải nghiệm mượt mà và an toàn nhất.
