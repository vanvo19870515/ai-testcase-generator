#!/usr/bin/env python3
"""
Script để chạy AI Test Case Generator Web App
"""

import subprocess
import sys
import os
from pathlib import Path

def check_requirements():
    """Check if required packages are installed"""
    required_packages = ['fastapi', 'uvicorn', 'jinja2']

    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print(f"❌ Thiếu các package: {', '.join(missing_packages)}")
        print("💡 Cài đặt: pip install -r requirements.txt")
        return False

    return True

def main():
    """Run the FastAPI web app"""
    print("🤖 AI Test Case Generator Web App")
    print("🚀 Khởi động server...")
    print("📱 Truy cập: http://localhost:8000")
    print("❌ Dùng Ctrl+C để dừng")
    print()

    # Check requirements
    if not check_requirements():
        sys.exit(1)

    # Check if app.py exists
    app_path = Path(__file__).parent / "app.py"
    if not app_path.exists():
        print("❌ Không tìm thấy file app.py")
        sys.exit(1)

    # Check environment variables
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY"))

    if not (has_openai or has_anthropic):
        print("⚠️  CẢNH BÁO: Không tìm thấy API key!")
        print("   Thêm OPENAI_API_KEY hoặc ANTHROPIC_API_KEY vào file .env")
        print("   Web app vẫn sẽ chạy nhưng một số tính năng có thể không hoạt động.")
        print()

    try:
        # Run FastAPI app
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app:app",
            "--host", "127.0.0.1",
            "--port", "8000",
            "--reload",
            "--log-level", "info"
        ], check=True)

    except KeyboardInterrupt:
        print("\n👋 Đã dừng web app")
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi khi chạy web app: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
