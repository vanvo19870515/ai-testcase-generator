# 🤖 AI Test Case Generator - Cursor Edition

Ứng dụng tạo test cases thủ công dùng **Cursor Cloud Agents**, chạy trực tiếp trên GitHub Pages (client-side, không backend).

## ✨ Tính năng
- 🚀 **Cursor AI**: Sinh test cases từ prompt
- 📋 **Loại test**: Functional, Negative, Edge Case
- 📄 **Download**: Xuất ra file text/markdown
- 🌐 **Chạy trên browser**: Mở link là dùng, không cần server
- 💡 **UI đơn giản**: Nhập prompt → nhận test cases

## ⚠️ Lưu ý về API key
- Hiện code đang hardcode Cursor API key trong frontend (không an toàn).  
- Khuyến nghị: dùng proxy/backend để giữ key an toàn, hoặc yêu cầu user tự nhập key trên UI.

## 🚀 Sử dụng
### Cách 1: GitHub Pages
- Truy cập: https://vanvo19870515.github.io/ai-testcase-generator/
- Nhập requirement (ví dụ: “Đăng nhập với email và mật khẩu”) và bấm gửi.

### Cách 2: Chạy local (dev)
```bash
git clone https://github.com/vanvo19870515/ai-testcase-generator.git
cd ai-testcase-generator
python -m http.server 8000  # hoặc mở trực tiếp index.html
```

## 🛠️ Tùy chỉnh
- Đổi API key trong `js/app.js` (nhưng đừng commit key thật).  
- Nếu muốn bảo mật: tạo proxy server/worker, đặt key vào biến môi trường, rồi trỏ frontend gọi proxy.

## 📌 Ghi chú
- Không còn dùng Gemini/OpenAI/Anthropic; chỉ Cursor API.
- Không có xuất Excel; chỉ tải text/markdown.
