# 🤖 AI Test Case Generator

Công cụ tự động tạo test cases manual chuẩn sử dụng trí tuệ nhân tạo (AI) và xuất ra file Excel.

## ✨ Tính năng

- 🚀 **AI-powered**: Sử dụng OpenAI GPT-4 hoặc Anthropic Claude để tạo test cases
- 📋 **Đa dạng loại test**: Functional, Negative, Edge Case, Regression, v.v.
- 📊 **Xuất Excel**: Tự động format và xuất test cases ra file Excel chuẩn
- 🎯 **Test cases chuẩn**: Tuân thủ best practices của QA
- 🌐 **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh
- 🎨 **Rich UI**: Giao diện terminal đẹp với Rich library

## 📋 Yêu cầu hệ thống

- Python 3.8+
- OpenAI API key hoặc Anthropic API key
- pip để cài đặt dependencies

## 🚀 Cài đặt

1. **Clone repository:**
```bash
git clone <repository-url>
cd ai-testcase-generator
```

2. **Tạo virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

4. **Cấu hình API key:**

Tạo file `.env` trong thư mục gốc:
```env
# Chọn một trong hai
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## 📖 Cách sử dụng

### Chạy cơ bản

```bash
python src/main.py
```

Sau đó làm theo hướng dẫn trên màn hình:
1. Nhập requirement của bạn
2. Chọn AI provider (openai/anthropic)
3. Chọn loại test cần tạo

### Ví dụ requirement

```
Tạo test cases cho tính năng đăng nhập của ứng dụng web:
- Người dùng có thể đăng nhập với email và mật khẩu
- Hệ thống kiểm tra email format
- Mật khẩu phải có ít nhất 8 ký tự
- Có chức năng "Quên mật khẩu"
```

### Output

- File Excel sẽ được tạo tự động với format chuẩn
- Mỗi test case có đầy đủ thông tin: ID, Scenario, Steps, Expected Result, v.v.

## 📊 Cấu trúc Test Case

Mỗi test case được tạo sẽ bao gồm:

| Trường | Mô tả |
|--------|-------|
| Test Case ID | Mã định danh duy nhất (TC_FUNCTIONAL_001) |
| Test Scenario | Mô tả tình huống test |
| Test Case Name | Tên test case ngắn gọn |
| Test Steps | Các bước thực hiện (đánh số) |
| Expected Result | Kết quả mong đợi |
| Preconditions | Điều kiện tiên quyết |
| Test Data | Dữ liệu test cần thiết |
| Priority | Độ ưu tiên (High/Medium/Low) |
| Test Type | Loại test (Functional/Negative/Edge Case) |

## 🔧 Cấu hình nâng cao

### Thay đổi AI model

Trong code `src/main.py`, bạn có thể thay đổi model:

```python
# OpenAI
response = self.client.chat.completions.create(
    model="gpt-4",  # hoặc "gpt-3.5-turbo"
    ...
)

# Anthropic
response = self.client.messages.create(
    model="claude-3-sonnet-20240229",  # hoặc model khác
    ...
)
```

### Tùy chỉnh prompt

Sửa function `_create_prompt()` để thay đổi cách AI tạo test cases.

## 📁 Cấu trúc dự án

```
ai-testcase-generator/
├── src/
│   └── main.py              # Script chính
├── templates/               # Templates cho test cases
├── examples/                # Ví dụ input/output
├── docs/                    # Documentation
├── requirements.txt         # Dependencies
├── .env.example            # Template cho .env
├── .gitignore              # Git ignore rules
└── README.md               # File này
```

## 🎯 Best Practices

### Viết requirement tốt

- **Cụ thể**: Mô tả rõ ràng tính năng cần test
- **Hoàn chỉnh**: Bao gồm tất cả edge cases
- **Rõ ràng**: Tránh dùng từ mơ hồ
- **Ngắn gọn**: Không quá dài dòng

### Ví dụ requirement tốt

❌ **Tốt**: "Test login feature with valid and invalid credentials"

✅ **Tốt hơn**: "Test login feature where users can:
- Login with valid email/password
- See error for invalid email format
- See error for wrong password
- Access password reset functionality"

## 🔍 Troubleshooting

### Lỗi API key
```
Error: OPENAI_API_KEY not found in environment variables
```
**Giải pháp**: Tạo file `.env` và thêm API key

### Lỗi JSON parsing
```
Error parsing AI response: ...
```
**Giải pháp**: AI response không đúng format JSON. Thử lại hoặc kiểm tra API key

### File Excel không tạo được
```
Permission denied: test_cases.xlsx
```
**Giải pháp**: Đóng file Excel nếu đang mở, hoặc đổi tên file output

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Happy Testing! 🧪✨**
