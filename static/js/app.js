/**
 * AI Test Case Generator - JavaScript
 * Handle form submission và download functionality
 */

class AITestCaseGenerator {
    constructor() {
        this.form = document.getElementById('generateForm');
        this.resultsSection = document.getElementById('resultsSection');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.resultsContent = document.getElementById('resultsContent');
        this.successMessage = document.getElementById('successMessage');
        this.resultMessage = document.getElementById('resultMessage');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.fileInfo = document.getElementById('fileInfo');

        this.currentDownloadId = null;

        this.init();
    }

    init() {
        // Bind form submit
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Bind download button
        this.downloadBtn.addEventListener('click', () => this.handleDownload());

        // Check API status on load
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

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const featurePrompt = formData.get('feature_prompt').trim();

        if (!featurePrompt) {
            this.showError('Feature prompt không được để trống!');
            return;
        }

        // Get selected test types
        const testTypes = formData.getAll('test_types');
        if (testTypes.length === 0) {
            this.showError('Vui lòng chọn ít nhất một loại test!');
            return;
        }

        // Show loading state
        this.showLoading();

        try {
            // Prepare request data
            const requestData = new FormData();
            requestData.append('feature_prompt', featurePrompt);
            testTypes.forEach(type => requestData.append('test_types', type));

            // Send request
            const response = await fetch('/generate', {
                method: 'POST',
                body: requestData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result);
            } else {
                throw new Error(result.detail || 'Có lỗi xảy ra');
            }

        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'Có lỗi xảy ra khi tạo test cases');
        }
    }

    showLoading() {
        this.resultsSection.style.display = 'block';
        this.loadingSpinner.style.display = 'block';
        this.resultsContent.style.display = 'none';
        this.form.querySelector('button[type="submit"]').disabled = true;
        this.form.querySelector('button[type="submit"]').innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Đang tạo...</span>';
    }

    showSuccess(result) {
        this.loadingSpinner.style.display = 'none';
        this.resultsContent.style.display = 'block';

        // Update success message
        this.resultMessage.textContent = result.message;

        // Store download ID
        this.currentDownloadId = result.download_id;

        // Update file info
        this.fileInfo.innerHTML = `
            <h4>📁 Thông tin file</h4>
            <p><strong>Số test cases:</strong> ${result.test_count}</p>
            <p><strong>Tên file:</strong> ${result.excel_file}</p>
            <p><strong>Trạng thái:</strong> <span style="color: #10b981;">Sẵn sàng tải xuống</span></p>
        `;

        // Re-enable form
        this.form.querySelector('button[type="submit"]').disabled = false;
        this.form.querySelector('button[type="submit"]').innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Tạo Test Cases</span>';

        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showError(message) {
        this.loadingSpinner.style.display = 'none';
        this.resultsContent.style.display = 'none';
        this.resultsSection.style.display = 'block';

        // Re-enable form
        this.form.querySelector('button[type="submit"]').disabled = false;
        this.form.querySelector('button[type="submit"]').innerHTML = '<span class="btn-icon">🚀</span><span class="btn-text">Tạo Test Cases</span>';

        this.showNotification(message, 'error');
    }

    async handleDownload() {
        if (!this.currentDownloadId) {
            this.showNotification('Không có file để tải xuống', 'error');
            return;
        }

        try {
            // Create download link
            const downloadUrl = `/download/${this.currentDownloadId}`;
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'test_cases.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showNotification('📥 Đang tải xuống file Excel...', 'success');

        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Lỗi khi tải xuống file', 'error');
        }
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

// Global functions for HTML onclick
function showExample(exampleId) {
    // Hide all examples
    const examples = document.querySelectorAll('.example-content');
    examples.forEach(example => example.classList.remove('active'));

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected example
    document.getElementById(exampleId + 'Example').classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AITestCaseGenerator();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
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
