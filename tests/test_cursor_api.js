
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock window and global objects
global.window = {};
global.fetch = async () => ({
    ok: true,
    json: async () => ({
        candidates: [{
            content: {
                parts: [{
                    text: JSON.stringify({
                        test_cases: [
                            {
                                test_case_id: "TC_001",
                                test_case_name: "Test 1"
                            }
                        ]
                    })
                }]
            }
        }]
    })
});

// Load the CursorAPI class
const cursorApiPath = path.join(__dirname, '../js/cursor-api.js');
const cursorApiContent = fs.readFileSync(cursorApiPath, 'utf8');

// Evaluate the file content to define the class in the global scope
// We need to define CursorAPI if the file assumes it's being defined
eval(cursorApiContent);

const CursorAPI = global.CursorAPI || window.CursorAPI;

async function runTests() {
    console.log('Running CursorAPI tests...');

    // Test 1: Class existence
    assert(CursorAPI, 'CursorAPI class should be defined');
    const api = new CursorAPI('test-key');
    assert(api, 'Should be able to instantiate CursorAPI');

    // Test 2: buildPrompt
    const requirement = "Login feature";
    const types = ['functional'];
    const prompt = api.buildPrompt(requirement, types);
    assert(prompt.includes(requirement), 'Prompt should include requirement');
    assert(prompt.includes('functional'), 'Prompt should include test types');

    // Test 3: parseResponse
    const mockData = {
        candidates: [{
            content: {
                parts: [{
                    text: `Here is the JSON:
                    {
                        "test_cases": [
                            { "test_case_id": "TC_001", "test_case_name": "Login Success" }
                        ]
                    }`
                }]
            }
        }]
    };
    const parsed = api.parseResponse(mockData);
    assert.strictEqual(parsed.length, 1, 'Should parse 1 test case');
    assert.strictEqual(parsed[0].test_case_id, 'TC_001', 'Should have correct ID');

    console.log('✅ All tests passed!');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
