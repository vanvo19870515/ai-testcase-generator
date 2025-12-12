#!/usr/bin/env python3
"""
AI Test Case Generator Web App
FastAPI backend với HTML frontend hoàn chỉnh
"""

import os
import uuid
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from dataclasses import asdict

import uvicorn
from fastapi import FastAPI, Request, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import local modules
from src.main import AITestCaseGenerator

# Initialize FastAPI app
app = FastAPI(
    title="AI Test Case Generator",
    description="Tự động tạo test cases chuẩn từ AI",
    version="1.0.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Global generator instance
generator = None

def get_generator():
    """Get or create AI generator instance"""
    global generator
    if generator is None:
        ai_provider = os.getenv("DEFAULT_AI_PROVIDER", "openai")
        generator = AITestCaseGenerator(ai_provider=ai_provider)
    return generator

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Home page với form input"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "AI Test Case Generator"
    })

@app.post("/generate")
async def generate_test_cases(
    request: Request,
    feature_prompt: str = Form(..., description="Feature prompt để tạo test cases"),
    test_types: List[str] = Form(default=["functional", "negative", "edge_case"], description="Loại test cases cần tạo")
):
    """API endpoint để generate test cases và trả về markdown"""

    if not feature_prompt.strip():
        raise HTTPException(status_code=400, detail="Feature prompt không được để trống")

    try:
        # Get generator
        gen = get_generator()

        # Generate test cases
        test_cases = gen.generate_test_cases(feature_prompt, test_types)

        if not test_cases:
            raise HTTPException(status_code=500, detail="Không thể tạo test cases. Kiểm tra API key.")

        # Export to Excel
        excel_file = gen.export_to_excel(test_cases)

        # Generate unique download ID
        download_id = str(uuid.uuid4())

        # Store file info in memory (simple approach)
        # In production, use Redis or database
        app.state.generated_files = getattr(app.state, 'generated_files', {})
        app.state.generated_files[download_id] = {
            'file_path': excel_file,
            'created_at': datetime.now(),
            'test_count': len(test_cases),
            'feature': feature_prompt[:100] + "..." if len(feature_prompt) > 100 else feature_prompt
        }

        # Format response for chat interface
        return {
            "success": True,
            "download_id": download_id,
            "test_cases": [asdict(tc) for tc in test_cases],
            "message": f"Đã tạo thành công {len(test_cases)} test cases!"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")

@app.get("/download/{download_id}")
async def download_excel(download_id: str):
    """Download Excel file"""
    if not hasattr(app.state, 'generated_files') or download_id not in app.state.generated_files:
        raise HTTPException(status_code=404, detail="File không tồn tại hoặc đã hết hạn")

    file_info = app.state.generated_files[download_id]

    # Check if file exists
    if not os.path.exists(file_info['file_path']):
        raise HTTPException(status_code=404, detail="File không tìm thấy")

    # Return file
    return FileResponse(
        path=file_info['file_path'],
        filename=os.path.basename(file_info['file_path']),
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@app.get("/status")
async def get_status():
    """Check API status và API key configuration"""
    status = {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "api_keys": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "anthropic": bool(os.getenv("ANTHROPIC_API_KEY"))
        },
        "generated_files_count": len(getattr(app.state, 'generated_files', {}))
    }
    return status

@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    app.state.generated_files = {}

    # Check API keys
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    has_anthropic = bool(os.getenv("ANTHROPIC_API_KEY"))

    if not (has_openai or has_anthropic):
        print("⚠️  CẢNH BÁO: Không tìm thấy API key!")
        print("   Thêm OPENAI_API_KEY hoặc ANTHROPIC_API_KEY vào file .env")
    else:
        print("✅ API keys đã được cấu hình")

if __name__ == "__main__":
    print("🤖 AI Test Case Generator Web App")
    print("🚀 Khởi động server...")
    print("📱 Truy cập: http://localhost:8000")
    print("❌ Dùng Ctrl+C để dừng")

    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
