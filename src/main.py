#!/usr/bin/env python3
"""
AI Test Case Generator
Tự động tạo test case manual chuẩn theo yêu cầu sử dụng AI
"""

import os
import json
import pandas as pd
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

import openai
import anthropic
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

console = Console()

@dataclass
class TestCase:
    """Test Case data structure"""
    test_case_id: str
    test_scenario: str
    test_case_name: str
    test_steps: str
    expected_result: str
    actual_result: str = ""
    status: str = "Not Executed"
    priority: str = "Medium"
    test_type: str = "Functional"
    preconditions: str = ""
    test_data: str = ""
    notes: str = ""

class AITestCaseGenerator:
    """AI-powered Test Case Generator"""

    def __init__(self, ai_provider: str = "openai"):
        self.ai_provider = ai_provider
        self.client = self._initialize_client()

    def _initialize_client(self):
        """Initialize AI client based on provider"""
        if self.ai_provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
            return openai.OpenAI(api_key=api_key)
        elif self.ai_provider == "anthropic":
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
            return anthropic.Anthropic(api_key=api_key)
        else:
            raise ValueError(f"Unsupported AI provider: {self.ai_provider}")

    def generate_test_cases(self, requirement: str, test_types: List[str] = None) -> List[TestCase]:
        """
        Generate test cases using AI based on requirements

        Args:
            requirement: User requirement description
            test_types: List of test types to generate (functional, ui, api, etc.)

        Returns:
            List of generated TestCase objects
        """
        if test_types is None:
            test_types = ["functional", "negative", "edge_case", "regression"]

        all_test_cases = []

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            for test_type in test_types:
                task = progress.add_task(f"Generating {test_type} test cases...", total=1)

                prompt = self._create_prompt(requirement, test_type)
                response = self._call_ai_api(prompt)

                test_cases = self._parse_ai_response(response, test_type)
                all_test_cases.extend(test_cases)

                progress.update(task, completed=1)

        return all_test_cases

    def _create_prompt(self, requirement: str, test_type: str) -> str:
        """Create AI prompt for test case generation"""
        base_prompt = f"""
        Bạn là chuyên gia QA senior. Hãy tạo test cases manual chuẩn cho requirement sau:

        REQUIREMENT: {requirement}

        TEST TYPE: {test_type.upper()}

        YÊU CẦU:
        - Tạo 3-5 test cases cho loại {test_type}
        - Mỗi test case phải có:
          * Test Case ID (format: TC_{test_type.upper()}_001, etc.)
          * Test Scenario: Mô tả tình huống test
          * Test Case Name: Tên ngắn gọn, rõ ràng
          * Test Steps: Các bước thực hiện (đánh số 1, 2, 3...)
          * Expected Result: Kết quả mong đợi
          * Preconditions: Điều kiện tiên quyết (nếu có)
          * Test Data: Dữ liệu test cần thiết
          * Priority: High/Medium/Low
        - Test cases phải cover đầy đủ requirement
        - Sử dụng ngôn ngữ tiếng Việt

        FORMAT OUTPUT: JSON array của objects, mỗi object có các trường trên.
        """

        return base_prompt.strip()

    def _call_ai_api(self, prompt: str) -> str:
        """Call AI API to generate test cases"""
        try:
            if self.ai_provider == "openai":
                response = self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "Bạn là chuyên gia QA tạo test cases chuẩn."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=2000,
                    temperature=0.7
                )
                return response.choices[0].message.content

            elif self.ai_provider == "anthropic":
                response = self.client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=2000,
                    system="Bạn là chuyên gia QA tạo test cases chuẩn.",
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                return response.content[0].text

        except Exception as e:
            console.print(f"[red]Error calling AI API: {e}[/red]")
            raise

    def _parse_ai_response(self, response: str, test_type: str) -> List[TestCase]:
        """Parse AI response into TestCase objects"""
        try:
            # Clean response if needed
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.endswith("```"):
                response = response[:-3]

            # Parse JSON
            test_cases_data = json.loads(response)

            test_cases = []
            for i, tc_data in enumerate(test_cases_data, 1):
                # Ensure required fields exist
                tc_data.setdefault('test_case_id', f"TC_{test_type.upper()}_{i:03d}")
                tc_data.setdefault('status', 'Not Executed')
                tc_data.setdefault('test_type', test_type.title())
                tc_data.setdefault('priority', 'Medium')

                test_case = TestCase(**tc_data)
                test_cases.append(test_case)

            return test_cases

        except json.JSONDecodeError as e:
            console.print(f"[red]Error parsing AI response: {e}[/red]")
            console.print(f"[yellow]Response: {response}[/yellow]")
            return []

    def export_to_excel(self, test_cases: List[TestCase], filename: str = None) -> str:
        """
        Export test cases to Excel file

        Args:
            test_cases: List of TestCase objects
            filename: Output filename (optional)

        Returns:
            Path to created Excel file
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"test_cases_{timestamp}.xlsx"

        # Convert to DataFrame
        data = []
        for tc in test_cases:
            tc_dict = asdict(tc)
            data.append(tc_dict)

        df = pd.DataFrame(data)

        # Reorder columns for better readability
        columns_order = [
            'test_case_id', 'test_scenario', 'test_case_name', 'preconditions',
            'test_steps', 'test_data', 'expected_result', 'actual_result',
            'status', 'priority', 'test_type', 'notes'
        ]

        # Only include columns that exist
        existing_columns = [col for col in columns_order if col in df.columns]
        df = df[existing_columns]

        # Create Excel writer with formatting
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Test Cases', index=False)

            # Get workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Test Cases']

            # Set column widths
            for i, col in enumerate(df.columns):
                max_length = max(
                    df[col].astype(str).map(len).max(),
                    len(col)
                )
                worksheet.column_dimensions[chr(65 + i)].width = min(max_length + 2, 50)

            # Style header row
            from openpyxl.styles import Font, PatternFill
            header_font = Font(bold=True, color="FFFFFF")
            header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")

            for cell in worksheet[1]:
                cell.font = header_font
                cell.fill = header_fill

        console.print(f"[green]✓ Test cases exported to: {filename}[/green]")
        return filename

def main():
    """Main function - Simplified version"""
    console.print("[bold blue]🤖 AI Test Case Generator[/bold blue]")
    console.print("🚀 Chỉ cần nhập 1 prompt feature, tự động tạo test cases chuẩn & xuất Excel!\n")

    # Get simple feature prompt
    feature_prompt = console.input("[bold cyan]📝 Nhập feature cần test (ví dụ: 'đăng nhập với email/password'):[/bold cyan]\n")

    if not feature_prompt.strip():
        console.print("[red]❌ Error: Feature prompt không được để trống![/red]")
        return

    # Auto-configure with defaults
    ai_provider = os.getenv("DEFAULT_AI_PROVIDER", "openai")
    default_test_types = os.getenv("DEFAULT_TEST_TYPES", "functional,negative,edge_case")
    test_types = [t.strip() for t in default_test_types.split(",")]

    console.print(f"[dim]🤖 Sử dụng AI: {ai_provider.upper()}[/dim]")
    console.print(f"[dim]📊 Loại test: {', '.join(test_types)}[/dim]")

    try:
        # Initialize generator
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            init_task = progress.add_task("🚀 Khởi tạo AI Generator...", total=1)

            generator = AITestCaseGenerator(ai_provider=ai_provider)

            progress.update(init_task, completed=1)

        # Generate test cases
        console.print(f"\n[bold yellow]🎯 Đang tạo test cases cho feature: '{feature_prompt}'[/bold yellow]")

        test_cases = generator.generate_test_cases(feature_prompt, test_types)

        if not test_cases:
            console.print("[red]❌ Không thể tạo test cases. Vui lòng kiểm tra API key và thử lại.[/red]")
            return

        console.print(f"[green]✅ Đã tạo thành công {len(test_cases)} test cases![/green]")

        # Auto export to Excel
        console.print("[bold yellow]📊 Đang xuất file Excel...[/bold yellow]")
        excel_file = generator.export_to_excel(test_cases)

        # Summary with celebration
        console.print("
[bold green]🎉 HOÀN THÀNH! TEST CASES ĐÃ SẴN SÀNG:[/bold green]"        console.print(f"📋 Tổng số test cases: [bold]{len(test_cases)}[/bold]")
        console.print(f"🎯 Feature: [bold]{feature_prompt}[/bold]")
        console.print(f"📁 File Excel: [bold]{excel_file}[/bold]")

        # Show sample test case
        if test_cases:
            console.print("
[bold cyan]💡 VÍ DỤ TEST CASE:[/bold cyan]"            tc = test_cases[0]
            console.print(f"🆔 ID: [bold]{tc.test_case_id}[/bold]")
            console.print(f"📝 Tên: [bold]{tc.test_case_name}[/bold]")
            console.print(f"⭐ Ưu tiên: [bold]{tc.priority}[/bold]")
            console.print(f"🔧 Loại: [bold]{tc.test_type}[/bold]")

        console.print("
[dim]💡 Mẹo: Mở file Excel để xem đầy đủ test cases chi tiết![/dim]"    except Exception as e:
        console.print(f"[red]❌ Error: {e}[/red]")
        console.print("[yellow]💡 Kiểm tra: API key có đúng không? Kết nối internet ổn không?[/yellow]")

if __name__ == "__main__":
    main()
