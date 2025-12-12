/**
 * AI Test Case Generator - Chat Interface
 * Handle chat-like interface with markdown display and Excel export
 */

class AITestCaseGenerator {
    constructor() {
        this.input = document.getElementById('featurePrompt');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.charCount = document.getElementById('charCount');

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

        // Check API status
        this.checkAPIStatus();
    }

    async checkAPIStatus() {
        try {
            const response = await fetch('/status');
            const status = await response.json();

            if (!status.api_keys.openai && !status.api_keys.anthropic) {
                this.showNotification('⚠️ CẢNH BÁO: Không tìm thấy API key. Một số tính năng có thể không hoạt động.', 'warning');
            }
        } catch (error) {
            console.error('Error checking API status:', error);
        }
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
        this.showTypingIndicator();

        try {
            // Send request
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'feature_prompt': prompt,
                    'test_types': 'functional,negative,edge_case'
                })
            });

            const result = await response.json();

            // Remove typing indicator
            this.removeTypingIndicator();
            this.isLoading = false;

            if (result.success) {
                // Convert test cases to markdown
                const markdown = this.formatTestCasesAsMarkdown(result.test_cases || []);
                this.addMessage('ai', markdown, result.download_id);
            } else {
                throw new Error(result.detail || 'Có lỗi xảy ra');
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.isLoading = false;
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
                            <button class="btn btn-success btn-sm" onclick="window.app.downloadExcel('${downloadId}')">
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
            markdown += `## ${index + 1}. ${tc.test_case_name}\n\n`;
            markdown += `**ID:** ${tc.test_case_id}\n`;
            markdown += `**Priority:** ${tc.priority}\n`;
            markdown += `**Type:** ${tc.test_type}\n\n`;

            if (tc.preconditions) {
                markdown += `**Preconditions:**\n${tc.preconditions}\n\n`;
            }

            markdown += `**Steps:**\n${tc.test_steps}\n\n`;

            markdown += `**Expected Result:**\n${tc.expected_result}\n\n`;

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

    downloadExcel(downloadId) {
        const downloadUrl = `/download/${downloadId}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'test_cases.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('📥 Đang tải xuống file Excel...', 'success');
    }

    checkAPIStatus() {
        // Check API status on load (optional)
        fetch('/status')
            .then(response => response.json())
            .then(status => {
                if (!status.api_keys.openai && !status.api_keys.anthropic) {
                    this.showNotification('⚠️ CẢNH BÁO: Không tìm thấy API key. Một số tính năng có thể không hoạt động.', 'warning');
                }
            })
            .catch(error => {
                console.error('Error checking API status:', error);
            });
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            min-width: 300px;
            max-width: 500px;
            padding: 0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease-out;
        `;

        // Set colors based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px 20px;
            background: ${colors[type]};
            color: white;
            border-radius: 8px;
        `;

        notification.querySelector('.notification-close').style.cssText = `
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0.8;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
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

// Add CSS for typing indicator and chat interface
const style = document.createElement('style');
style.textContent = `
    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6b7280;
        animation: typing 1.4s infinite;
    }

    .typing-dots span:nth-child(1) { animation-delay: 0s; }
    .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
    }

    .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
    }

    .message.error .message-bubble {
        background: #fee2e2;
        border-color: #fca5a5;
        color: #dc2626;
    }

    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AITestCaseGenerator();
});
