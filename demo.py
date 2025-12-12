#!/usr/bin/env python3
"""
Demo script để test AI Test Case Generator
Chạy demo với sample data để kiểm tra hoạt động
"""

import os
from pathlib import Path

def demo_cli():
    """Demo CLI version"""
    print("🎯 Demo CLI Version")
    print("==================")

    # Check if API key exists
    if not os.getenv("OPENAI_API_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        print("⚠️  CẢNH BÁO: Không tìm thấy API key!")
        print("   Vui lòng thêm OPENAI_API_KEY hoặc ANTHROPIC_API_KEY vào file .env")
        print("   File này sẽ tạo test cases mẫu để demo.")
        print()

    # Import here to avoid errors if dependencies not installed
    try:
        from src.main import AITestCaseGenerator

        # Demo với sample data
        generator = AITestCaseGenerator(ai_provider="openai")  # Will fallback gracefully

        sample_prompt = "Đăng nhập với email và mật khẩu"

        print(f"📝 Sample prompt: '{sample_prompt}'")
        print("🤖 Generating test cases...")

        # This will fail gracefully without API key
        test_cases = generator.generate_test_cases(sample_prompt, ["functional", "negative"])

        if test_cases:
            excel_file = generator.export_to_excel(test_cases)
            print(f"✅ Success! Created {len(test_cases)} test cases in {excel_file}")
        else:
            print("❌ Failed to generate test cases (expected without API key)")

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Cài đặt dependencies: pip install -r requirements.txt")

def demo_web():
    """Demo Web version"""
    print("🌐 Demo Web Version")
    print("==================")

    try:
        import streamlit
        print("✅ Streamlit đã được cài đặt")
        print("🚀 Chạy: python run_web.py")
        print("📱 Sau đó mở: http://localhost:8501")
    except ImportError:
        print("❌ Streamlit chưa được cài đặt")
        print("💡 Cài đặt: pip install streamlit")

def main():
    """Main demo function"""
    print("🤖 AI TEST CASE GENERATOR - DEMO")
    print("=" * 40)
    print()

    demo_cli()
    print()
    demo_web()
    print()

    print("📚 THÔNG TIN THÊM:")
    print("- 📖 Docs: README.md")
    print("- 🐙 GitHub: https://github.com/vanvo19870515/ai-testcase-generator")
    print("- 📱 Demo web: https://vanvo19870515.github.io/ai-testcase-generator/")
    print()

    print("🎯 CÁCH SỬ DỤNG NHANH:")
    print("1. pip install -r requirements.txt")
    print("2. Tạo file .env với API key")
    print("3. python run_web.py (web interface)")
    print("4. Hoặc: python src/main.py (CLI)")
    print()

if __name__ == "__main__":
    main()
