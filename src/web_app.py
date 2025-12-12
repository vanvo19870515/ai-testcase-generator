#!/usr/bin/env python3
"""
Web Interface cho AI Test Case Generator
Sử dụng Streamlit để tạo giao diện web đơn giản
"""

import streamlit as st
import os
from pathlib import Path
import pandas as pd
from datetime import datetime

# Import local modules
from main import AITestCaseGenerator

# Page config
st.set_page_config(
    page_title="🤖 AI Test Case Generator",
    page_icon="🧪",
    layout="wide",
    initial_sidebar_state="expanded"
)

def main():
    """Main Streamlit app"""

    # Header
    st.title("🤖 AI Test Case Generator")
    st.markdown("🚀 **Tự động tạo test cases chuẩn từ 1 prompt feature!**")

    # Sidebar
    with st.sidebar:
        st.header("⚙️ Cấu hình")

        # AI Provider selection
        ai_provider = st.selectbox(
            "🤖 AI Provider",
            ["openai", "anthropic"],
            index=0,
            help="Chọn AI provider để generate test cases"
        )

        # Test types selection
        test_types_options = ["functional", "negative", "edge_case", "regression", "ui", "api"]
        test_types = st.multiselect(
            "📊 Loại test",
            test_types_options,
            default=["functional", "negative", "edge_case"],
            help="Chọn các loại test case cần tạo"
        )

        st.markdown("---")

        # API Key status
        if ai_provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                st.success("✅ OpenAI API Key đã cấu hình")
            else:
                st.error("❌ Thiếu OPENAI_API_KEY")
                st.info("Thêm OPENAI_API_KEY vào file .env")
        else:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                st.success("✅ Anthropic API Key đã cấu hình")
            else:
                st.error("❌ Thiếu ANTHROPIC_API_KEY")
                st.info("Thêm ANTHROPIC_API_KEY vào file .env")

    # Main content
    col1, col2 = st.columns([2, 1])

    with col1:
        st.subheader("📝 Nhập Feature cần Test")

        # Feature input
        feature_prompt = st.text_area(
            "Feature Description",
            placeholder="Ví dụ: Đăng nhập với email và mật khẩu\n- Kiểm tra validation email\n- Mật khẩu tối thiểu 8 ký tự\n- Hiển thị lỗi khi sai thông tin",
            height=150,
            help="Mô tả feature cần tạo test cases. Có thể chi tiết hoặc ngắn gọn."
        )

        # Generate button
        generate_btn = st.button(
            "🚀 Tạo Test Cases",
            type="primary",
            use_container_width=True,
            disabled=not feature_prompt.strip()
        )

    with col2:
        st.subheader("📊 Template Preview")

        # Show template structure
        template_data = {
            "Test Case ID": ["TC_FUNCTIONAL_001"],
            "Test Scenario": ["Người dùng đăng nhập thành công"],
            "Test Case Name": ["Login with valid credentials"],
            "Test Steps": ["1. Truy cập trang login\n2. Nhập email/password\n3. Click Đăng nhập"],
            "Expected Result": ["Đăng nhập thành công, chuyển đến dashboard"],
            "Priority": ["High"],
            "Test Type": ["Functional"]
        }

        df_template = pd.DataFrame(template_data)
        st.dataframe(df_template, use_container_width=True)

        st.markdown("---")
        st.markdown("**📋 Template bao gồm:**")
        st.markdown("- Test Case ID duy nhất")
        st.markdown("- Steps chi tiết & rõ ràng")
        st.markdown("- Expected Result cụ thể")
        st.markdown("- Priority & Test Type")

    # Generate test cases
    if generate_btn and feature_prompt.strip():
        with st.spinner("🎯 Đang tạo test cases với AI..."):
            try:
                # Initialize generator
                generator = AITestCaseGenerator(ai_provider=ai_provider)

                # Generate test cases
                test_cases = generator.generate_test_cases(feature_prompt, test_types)

                if not test_cases:
                    st.error("❌ Không thể tạo test cases. Kiểm tra API key và thử lại.")
                    return

                # Export to Excel
                excel_file = generator.export_to_excel(test_cases)

                st.success(f"✅ Đã tạo thành công {len(test_cases)} test cases!")

                # Results section
                st.subheader("📊 Kết quả Test Cases")

                # Convert to DataFrame for display
                test_data = []
                for tc in test_cases:
                    test_data.append({
                        "ID": tc.test_case_id,
                        "Tên": tc.test_case_name,
                        "Loại": tc.test_type,
                        "Ưu tiên": tc.priority,
                        "Scenario": tc.test_scenario[:50] + "..." if len(tc.test_scenario) > 50 else tc.test_scenario
                    })

                df_results = pd.DataFrame(test_data)
                st.dataframe(df_results, use_container_width=True)

                # Detailed view
                with st.expander("🔍 Xem chi tiết test cases", expanded=False):
                    for i, tc in enumerate(test_cases, 1):
                        st.markdown(f"**{i}. {tc.test_case_name}**")
                        st.markdown(f"**ID:** {tc.test_case_id}")
                        st.markdown(f"**Loại:** {tc.test_type} | **Ưu tiên:** {tc.priority}")

                        col_a, col_b = st.columns(2)
                        with col_a:
                            st.markdown("**Steps:**")
                            st.code(tc.test_steps, language=None)
                        with col_b:
                            st.markdown("**Expected Result:**")
                            st.code(tc.expected_result, language=None)

                        if tc.preconditions:
                            st.markdown("**Preconditions:**")
                            st.code(tc.preconditions, language=None)

                        st.markdown("---")

                # Download section
                st.subheader("📥 Tải xuống")

                # Read Excel file for download
                try:
                    with open(excel_file, "rb") as f:
                        excel_bytes = f.read()

                    st.download_button(
                        label="📊 Tải file Excel",
                        data=excel_bytes,
                        file_name=excel_file,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        use_container_width=True
                    )
                except FileNotFoundError:
                    st.error(f"❌ Không tìm thấy file Excel: {excel_file}")

                # Summary
                st.success(f"🎉 File Excel đã được tạo: **{excel_file}**")
                st.info("💡 Mở file Excel để xem đầy đủ test cases với format chuẩn!")

            except Exception as e:
                st.error(f"❌ Lỗi: {str(e)}")
                st.info("💡 Kiểm tra API key và kết nối internet")

    # Footer
    st.markdown("---")
    st.markdown("**🤖 AI Test Case Generator** | Tự động tạo test cases chuẩn từ AI")
    st.markdown("[📖 Documentation](https://github.com/vanvo19870515/ai-testcase-generator) | [🐛 Report Issues](https://github.com/vanvo19870515/ai-testcase-generator/issues)")

if __name__ == "__main__":
    main()
