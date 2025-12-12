# 🤖 AI Test Case Generator - Cursor Edition

Ứng dụng tạo test cases thủ công dùng **Cursor Cloud Agents**, chạy trực tiếp trên GitHub Pages (client-side, không backend).

## ✨ Tính năng
- 🚀 **Cursor AI**: Sinh test cases từ prompt
- 📋 **Loại test**: Functional, Negative, Edge Case
- 📄 **Download**: Xuất ra file text/markdown
- 🌐 **Chạy trên browser**: Mở link là dùng, không cần server
- 💡 **UI đơn giản**: Nhập prompt → nhận test cases

## ⚠️ Lưu ý về API key / Proxy
- Nên dùng proxy/backend để giữ key an toàn, tránh CORS.
- Cấu hình nhanh ở `js/app.js`:
  - `window.CURSOR_PROXY_URL = 'https://ai-testcase-generator.vothituongvan87.workers.dev/'`
  - Nếu gọi trực tiếp (không khuyến nghị), đặt key vào `this.cursorApiKey = ''`.
  - Worker dùng OpenAI endpoint mặc định: `https://api.openai.com/v1/chat/completions`
  - Đặt env `OPENAI_API_KEY` trong Worker; có thể override upstream qua `UPSTREAM_URL`.

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
- Đổi proxy URL trong `js/app.js` (khuyến nghị).  
- Nếu phải gọi trực tiếp: điền API key (nhưng không an toàn, tránh commit).  
- Muốn bảo mật: tạo proxy server/worker, đặt key vào env, frontend chỉ gọi proxy.

## 📌 Ghi chú
- Không còn dùng Gemini/OpenAI/Anthropic; chỉ Cursor API.
- Không có xuất Excel; chỉ tải text/markdown.
