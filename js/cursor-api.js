/**
 * Cursor Cloud Agents API Client for GitHub Pages
 * Client-side integration with Cursor Cloud Agents API
 */

class CursorAPI {
    constructor(apiKey, baseURL) {
        this.apiKey = apiKey;
        // Allow overriding endpoint via global (proxy) or constructor
        this.baseURL = baseURL || window.CURSOR_PROXY_URL || 'https://api.cursor.com/v1/chat/completions';
    }

    async generateTestCases(requirement, testTypes = ['functional', 'negative', 'edge_case']) {
        const prompt = this.buildPrompt(requirement, testTypes);

        const requestBody = {
            model: "cursor-cloud-agent",
            messages: [
                {
                    role: "system",
                    content: "You are an expert QA engineer who creates comprehensive test cases. Always respond with valid JSON format for test cases."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        };

        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            // Only send auth headers when talking to Cursor API directly
            if (!window.CURSOR_PROXY_URL && this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
                headers['X-API-Key'] = this.apiKey;
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cursor API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return this.parseResponse(data);

        } catch (error) {
            console.error('Cursor API Error:', error);
            throw error;
        }
    }

    buildPrompt(requirement, testTypes) {
        return `Bạn là chuyên gia QA tạo test cases chuẩn cho phần mềm.

YÊU CẦU: ${requirement}

Hãy tạo test cases cho các loại sau: ${testTypes.join(', ')}

FORMAT OUTPUT (bắt buộc JSON):
{
  "test_cases": [
    {
      "test_case_id": "TC_FUNCTIONAL_001",
      "test_scenario": "Mô tả tình huống test",
      "test_case_name": "Tên test case ngắn gọn",
      "test_steps": "1. Bước 1\\n2. Bước 2\\n3. Bước 3",
      "expected_result": "Kết quả mong đợi",
      "preconditions": "Điều kiện tiên quyết (nếu có)",
      "test_data": "Dữ liệu test cần thiết",
      "priority": "High/Medium/Low",
      "test_type": "Functional/Negative/Edge Case"
    }
  ]
}

QUY TẮC:
- Tạo 3-5 test cases cho mỗi loại
- Sử dụng tiếng Việt
- Format JSON chính xác
- Test cases phải cover đầy đủ requirement
- ID format: TC_{TYPE}_{NUMBER}`;
    }

    parseResponse(data) {
        try {
            // Try to extract JSON from the response
            let content = '';
            
            // Handle OpenAI/Cursor format
            if (data.choices && data.choices[0] && data.choices[0].message) {
                content = data.choices[0].message.content;
            } 
            // Handle Gemini format (legacy)
            else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                content = data.candidates[0].content.parts[0].text;
            }

            if (!content) {
                throw new Error('No response content from API');
            }

            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const jsonData = JSON.parse(jsonMatch[0]);
            return jsonData.test_cases || [];

        } catch (error) {
            console.error('Parse error:', error);
            // Fallback: return the raw text
            return [{
                test_case_id: "TC_ERROR_001",
                test_scenario: "Error parsing AI response",
                test_case_name: "API Response Error",
                test_steps: "1. Check API key\n2. Check network connection\n3. Try again",
                expected_result: "Proper error handling",
                preconditions: "Valid API key and internet connection",
                test_data: "N/A",
                priority: "High",
                test_type: "Error",
                raw_response: data.candidates[0]?.content?.parts[0]?.text || 'No response'
            }];
        }
    }
}

// Export for use in other files
window.CursorAPI = CursorAPI;
