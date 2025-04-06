class DashboardManager {
    constructor() {
        this.initializeElements();
        this.loadDashboardData();
        this.initializeCharts();
    }

    initializeElements() {
        this.streakElement = document.getElementById('study-streak');
        this.successRateElement = document.getElementById('success-rate');
        this.wordsMasteredElement = document.getElementById('words-mastered');
        this.progressElement = document.getElementById('progress');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.recentSessions = document.getElementById('recent-sessions');
        this.wordGroups = document.getElementById('word-groups');
        this.weeklyChart = document.getElementById('weekly-chart');
    }

    async loadDashboardData() {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            this.updateDashboard(data);
            this.loadRecentSessions();
            this.loadWordGroups();
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    updateDashboard(data) {
        // Update streak with flame animation
        this.streakElement.textContent = `${data.study_streak} days`;
        if (data.study_streak > 0) {
            this.streakElement.classList.add('active-streak');
        }

        // Update success rate with animation
        this.animateValue('success-rate', 0, data.success_rate, 1500);
        document.querySelector('.progress-mini .progress-bar').style.width = `${data.success_rate}%`;

        // Update words mastered
        const masteredCount = Math.floor(data.correct_words * 0.8); // Consider words "mastered" at 80% success rate
        this.wordsMasteredElement.textContent = `${masteredCount} words`;
        
        // Update progress bar with animation
        this.animateValue('progress-percentage', 0, data.progress, 1500);
        this.progressElement.style.width = `${data.progress}%`;
    }

    async loadRecentSessions() {
        const response = await fetch('/api/sessions');
        const sessions = await response.json();
        const recentSessions = sessions.slice(-5).reverse();
        
        this.recentSessions.innerHTML = recentSessions.map(session => `
            <div class="activity-item">
                <div class="activity-icon ${session.correct_count > session.wrong_count ? 'success' : 'warning'}">
                    ${session.correct_count > session.wrong_count ? '✓' : '!'}
                </div>
                <div class="activity-details">
                    <span class="activity-title">${session.name}</span>
                    <span class="activity-meta">
                        ${new Date(session.start_time).toLocaleDateString()} · 
                        Score: ${session.correct_count * 10}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async loadWordGroups() {
        const response = await fetch('/api/words-group');
        const groups = await response.json();
        
        this.wordGroups.innerHTML = groups.map(group => `
            <div class="word-group-card">
                <h4>${group}</h4>
                <div class="group-progress">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
                <span class="group-stats">0/0 words</span>
            </div>
        `).join('');
    }

    initializeCharts() {
        const ctx = this.weeklyChart.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Words Learned',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    animateValue(elementId, start, end, duration) {
        const element = document.getElementById(elementId);
        const range = end - start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = `${current}%`;
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
