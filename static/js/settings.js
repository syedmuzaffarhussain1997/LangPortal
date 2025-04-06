class SettingsManager {
    constructor() {
        this.initializeElements();
        this.loadSettings();
        this.addEventListeners();
    }

    initializeElements() {
        this.form = document.getElementById('settings-form');
        this.themeSelect = document.getElementById('theme-select');
        this.primaryColor = document.getElementById('primary-color');
        this.resetButton = document.getElementById('reset-history');
        this.exportButton = document.getElementById('export-data');

        // Apply theme from storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        this.applyTheme(defaultTheme);
        this.themeSelect.value = defaultTheme;
    }

    async loadSettings() {
        try {
            // Load saved settings from localStorage
            const savedSettings = JSON.parse(localStorage.getItem('settings')) || {};
            this.applySettings(savedSettings);

            // Update color preview
            this.updateColorPreview(savedSettings.primaryColor || '#4a90e2');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    applySettings(settings) {
        if (settings.theme) {
            this.applyTheme(settings.theme);
        }
        if (settings.primaryColor) {
            this.applyPrimaryColor(settings.primaryColor);
        }
    }

    applyTheme(theme) {
        // Apply theme to both html and body elements
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Store theme preference
        localStorage.setItem('theme', theme);
        
        // Update all iframes if any
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                iframe.contentDocument.documentElement.setAttribute('data-theme', theme);
                iframe.contentDocument.body.setAttribute('data-theme', theme);
            } catch (e) {}
        });

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', 
                theme === 'dark' ? '#1a1a1a' : '#ffffff'
            );
        }

        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    applyPrimaryColor(color) {
        document.documentElement.style.setProperty('--primary-color', color);
        this.updateColorPreview(color);
    }

    updateColorPreview(color) {
        const preview = document.querySelector('.color-preview');
        if (preview) {
            preview.style.backgroundColor = color;
        }
    }

    async saveSettings(e) {
        e.preventDefault();
        
        const settings = {
            theme: this.themeSelect.value,
            primaryColor: this.primaryColor.value
        };

        try {
            localStorage.setItem('settings', JSON.stringify(settings));
            this.applyTheme(settings.theme);
            this.applyPrimaryColor(settings.primaryColor);
            this.showNotification('Settings saved successfully', 'success');
            
            // Force reload all stylesheets to ensure theme is applied
            this.reloadStyles();
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    reloadStyles() {
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.href;
            link.href = '';
            link.href = href;
        });
    }

    resetHistory() {
        if (!confirm('Are you sure you want to reset your study history? This will delete all session records and cannot be undone.')) {
            return;
        }

        try {
            // Only remove study-related data
            localStorage.removeItem('current_session');
            localStorage.removeItem('wordHistory');
            
            // Show success message
            this.showNotification('Study history has been reset', 'success');
            
            // Refresh the page after a short delay
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Error resetting history:', error);
            this.showNotification('Failed to reset history', 'error');
        }
    }

    exportData() {
        try {
            const studyData = {
                sessions: localStorage.getItem('current_session'),
                wordHistory: localStorage.getItem('wordHistory'),
                settings: localStorage.getItem('settings')
            };

            const blob = new Blob([JSON.stringify(studyData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `language-portal-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Failed to export data', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    addEventListeners() {
        this.form.addEventListener('submit', (e) => this.saveSettings(e));
        this.resetButton.addEventListener('click', () => this.resetHistory());
        this.exportButton.addEventListener('click', () => this.exportData());
        this.primaryColor.addEventListener('input', (e) => this.updateColorPreview(e.target.value));
    }
}

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
