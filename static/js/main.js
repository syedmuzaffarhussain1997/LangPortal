class LangPortal {
    constructor() {
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    async initializeEventListeners() {
        const startButton = document.getElementById('start-studying');
        if (startButton) {
            startButton.addEventListener('click', () => this.startStudySession());
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateDashboard(data) {
        document.getElementById('study-sessions').textContent = data.study_sessions;
        document.getElementById('success-rate').textContent = `${data.success_rate}%`;
        document.getElementById('study-streak').textContent = `${data.study_streak} days`;
        document.getElementById('progress').style.width = `${data.progress}%`;
    }

    async startStudySession() {
        try {
            const response = await fetch('/api/launch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ word_group: 'Core Verbs' })
            });
            if (response.ok) {
                window.location.href = '/study';
            }
        } catch (error) {
            console.error('Error starting study session:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LangPortal();
});
