#!/usr/bin/env python3
"""
Script để chạy web interface của AI Test Case Generator
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    """Chạy Streamlit web app"""
    web_app_path = Path(__file__).parent / "src" / "web_app.py"

    if not web_app_path.exists():
        print("❌ Không tìm thấy file web_app.py")
        sys.exit(1)

    print("🚀 Khởi động AI Test Case Generator Web Interface...")
    print("📱 Truy cập: http://localhost:8501")
    print("❌ Dùng Ctrl+C để dừng")

    try:
        # Chạy streamlit
        subprocess.run([
            sys.executable, "-m", "streamlit", "run",
            str(web_app_path), "--server.headless", "true"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Đã dừng web interface")
    except subprocess.CalledProcessError as e:
        print(f"❌ Lỗi khi chạy web app: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
