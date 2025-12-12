/**
 * AI Test Case Generator - GitHub Pages Version
 * Client-side application with Cursor API integration
 */

class AITestCaseGenerator {
    constructor() {
        // ==== CONFIG ====
        // If you have a proxy URL, set it here (recommended to avoid CORS & key exposure)
        // Using Cloudflare Worker:
        window.CURSOR_PROXY_URL = 'https://ai-testcase-generator.vothituongvan87.workers.dev/';

        // If calling Cursor API directly (not recommended on public web), put API key here
        this.cursorApiKey = '';

        this.input = document.getElementById('featurePrompt');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.charCount = document.getElementById('charCount');

        // Cursor API client (will use proxy URL if set above)
        this.api = new CursorAPI(this.cursorApiKey, window.CURSOR_PROXY_URL);
        this.apiName = 'Cursor';
        this.currentDownloadId = null;
        this.isLoading = false;

        this.init();
    }

    init() {
        // Bind events
        this.input.addEventListener('input', () => this.updateCharCount());
        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendBtn.addEventListener('click', () => this.sendMessage());

        // Initial char count
        this.updateCharCount();

        // Show welcome message
        this.showWelcomeMessage();
    }

    updateCharCount() {
        const count = this.input.value.length;
        this.charCount.textContent = `${count}/1000`;

        // Enable/disable send button
        this.sendBtn.disabled = count === 0 || this.isLoading;
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const prompt = this.input.value.trim();
        if (!prompt || this.isLoading) return;

        // Add user message
        this.addMessage('user', prompt);

        // Clear input
        this.input.value = '';
        this.updateCharCount();

        // Show loading
        this.isLoading = true;
        this.sendBtn.disabled = true;
        this.showTypingIndicator();

        try {
            // Call Cursor API
            const testCases = await this.api.generateTestCases(prompt);
            console.log(`✅ ${this.apiName} API successful`);

            // Remove typing indicator
            this.removeTypingIndicator();
            this.isLoading = false;
            this.sendBtn.disabled = false;

            if (testCases && testCases.length > 0) {
                // Format response as markdown
                const markdown = this.formatTestCasesAsMarkdown(testCases);
                this.addMessage('ai', `🤖 **${this.apiName} AI Response:**\n\n${markdown}`, null, false);

                // Show download button
                this.showDownloadButton(testCases);
            } else {
                throw new Error('Không thể tạo test cases. Vui lòng thử lại.');
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.isLoading = false;
            this.sendBtn.disabled = false;
            this.addMessage('ai', `❌ Lỗi: ${error.message}`, null, true);
        }
    }

    addMessage(type, content, downloadId = null, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = type === 'user' ? '👤' : '🤖';
        const avatarClass = type === 'user' ? 'user' : 'ai';

        messageDiv.innerHTML = `
            <div class="avatar ${avatarClass}">${avatar}</div>
            <div class="content">
                <div class="message-bubble ${isError ? 'error' : ''}">
                    <div class="message-${type === 'ai' ? 'markdown' : 'text'}">
                        ${type === 'ai' ? this.renderMarkdown(content) : this.escapeHtml(content)}
                    </div>
                    ${downloadId ? `
                        <div class="message-actions">
                            <button class="btn btn-success" onclick="window.app.downloadExcel('${downloadId}')">
                                📊 Download Excel
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showWelcomeMessage() {
        const welcomeMessage = `
🚀 **Chào mừng đến với AI Test Case Generator!**

Tôi có thể giúp bạn tự động tạo test cases chuẩn từ requirement của bạn.

**AI Engine:**
- 🤖 **Cursor Cloud Agents**

**Cách sử dụng:**
1. Nhập requirement vào ô bên dưới (ví dụ: "Đăng nhập với email và mật khẩu")
2. Nhấn Enter hoặc click nút gửi
3. AI sẽ tạo test cases và hiển thị kết quả
4. Download file text để lưu lại

**Lưu ý:** App đang gọi trực tiếp Cursor API từ trình duyệt. Nên dùng proxy để bảo mật key.
        `;

        setTimeout(() => {
            this.addMessage('ai', welcomeMessage);
        }, 500);
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="avatar ai">🤖</div>
            <div class="content">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Đang tạo test cases...</p>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    formatTestCasesAsMarkdown(testCases) {
        if (!testCases || testCases.length === 0) {
            return "Không thể tạo test cases. Vui lòng thử lại.";
        }

        let markdown = `# Test Cases Generated\n\n`;
        markdown += `**Tổng số:** ${testCases.length} test cases\n\n`;

        testCases.forEach((tc, index) => {
            markdown += `## ${index + 1}. ${tc.test_case_name || 'Test Case ' + (index + 1)}\n\n`;
            markdown += `**ID:** ${tc.test_case_id || `TC_UNKNOWN_${index + 1}`}\n`;

            if (tc.test_scenario) {
                markdown += `**Scenario:** ${tc.test_scenario}\n`;
            }

            markdown += `**Priority:** ${tc.priority || 'Medium'}\n`;
            markdown += `**Type:** ${tc.test_type || 'Functional'}\n\n`;

            if (tc.preconditions) {
                markdown += `**Preconditions:**\n${tc.preconditions}\n\n`;
            }

            if (tc.test_steps) {
                markdown += `**Steps:**\n${tc.test_steps}\n\n`;
            }

            if (tc.expected_result) {
                markdown += `**Expected Result:**\n${tc.expected_result}\n\n`;
            }

            if (tc.test_data) {
                markdown += `**Test Data:**\n${tc.test_data}\n\n`;
            }

            markdown += `---\n\n`;
        });

        return markdown;
    }

    renderMarkdown(text) {
        // Simple markdown renderer
        return text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .replace(/\n\n/gim, '</p><p>')
            .replace(/\n/gim, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    showDownloadButton(testCases) {
        const downloadButton = document.createElement('button');
        downloadButton.className = 'btn btn-success';
        downloadButton.innerHTML = '📥 Download Test Cases (Text)';
        downloadButton.onclick = () => this.downloadAsText(testCases);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.appendChild(downloadButton);

        // Add to last AI message
        const lastMessage = this.messagesContainer.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('ai')) {
            const bubble = lastMessage.querySelector('.message-bubble');
            if (bubble && !bubble.querySelector('.message-actions')) {
                bubble.appendChild(actionsDiv);
            }
        }
    }

    downloadAsText(testCases) {
        const content = this.formatTestCasesAsMarkdown(testCases);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'test_cases.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        this.showNotification('📥 Đã tải xuống file test cases!', 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span>${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: inherit; font-size: 20px; cursor: pointer;">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AITestCaseGenerator();
});
