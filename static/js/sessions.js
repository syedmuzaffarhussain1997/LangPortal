class SessionsManager {
    constructor() {
        this.initializeElements();
        this.loadSessions();
        this.addEventListeners();
    }

    initializeElements() {
        this.sessionsList = document.getElementById('sessions-list');
        this.dateFilter = document.getElementById('date-filter');
        this.groupFilter = document.getElementById('group-filter');
        this.sessionForm = document.getElementById('session-form');
        this.sessionNameInput = document.getElementById('session-name');
        this.customDuration = document.getElementById('custom-duration');
        this.customMinutes = document.getElementById('custom-minutes');
        
        // Add radio buttons event listeners
        const durationOptions = document.querySelectorAll('input[name="duration"]');
        durationOptions.forEach(option => {
            option.addEventListener('change', () => this.handleDurationChange(option.value));
        });
    }

    handleDurationChange(value) {
        this.customDuration.style.display = value === 'custom' ? 'block' : 'none';
    }

    async loadSessions() {
        try {
            const response = await fetch('/api/sessions');
            const sessions = await response.json();
            this.renderSessions(sessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    renderSessions(sessions) {
        if (!Array.isArray(sessions)) {
            console.error('Sessions data is not an array:', sessions);
            return;
        }

        this.sessionsList.innerHTML = sessions.map(session => {
            const sessionId = session.id;
            return `
                <tr data-session-id="${sessionId}">
                    <td data-label="Date">${new Date(session.start_time).toLocaleDateString()}</td>
                    <td data-label="Duration">${this.calculateDuration(session.start_time, session.end_time)}</td>
                    <td data-label="Words">${session.words_reviewed?.length || 0}</td>
                    <td data-label="Accuracy">${this.calculateAccuracy(session.words_reviewed)}%</td>
                    <td class="action-buttons">
                        <button class="secondary-button" data-action="view" data-id="${sessionId}">
                            <span class="icon">👁️</span>
                            <span class="button-text">View</span>
                        </button>
                        <button class="danger-button" data-action="delete" data-id="${sessionId}">
                            <span class="icon">🗑️</span>
                            <span class="button-text">Delete</span>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.addButtonEventListeners();
    }

    addButtonEventListeners() {
        // Remove any existing event listeners
        const buttons = this.sessionsList.querySelectorAll('button[data-action]');
        buttons.forEach(button => {
            const action = button.dataset.action;
            const id = parseInt(button.dataset.id);
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (action === 'delete') {
                    this.deleteSession(id);
                } else if (action === 'view') {
                    this.viewSession(id);
                }
            });
        });
    }

    async deleteSession(id) {
        try {
            if (!confirm('Are you sure you want to delete this session?')) {
                return;
            }

            const response = await fetch(`/api/sessions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete session');
            }

            // Remove the row directly
            const row = this.sessionsList.querySelector(`tr[data-session-id="${id}"]`);
            if (row) {
                row.classList.add('fade-out');
                setTimeout(() => {
                    row.remove();
                    this.showNotification('Session deleted successfully', 'success');
                }, 300);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            this.showNotification('Failed to delete session', 'error');
        }
    }

    calculateDuration(start, end) {
        if (!start || !end) return '0:00';
        const duration = new Date(end) - new Date(start);
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateAccuracy(words) {
        if (!words || words.length === 0) return 0;
        const correct = words.filter(w => w.correct).length;
        return Math.round((correct / words.length) * 100);
    }

    addEventListeners() {
        this.sessionForm.addEventListener('submit', (e) => this.createSession(e));
        this.durationSelect.addEventListener('change', (e) => {
            this.customDuration.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    async createSession(e) {
        e.preventDefault();
        const sessionName = this.sessionNameInput.value.trim();
        
        // Get selected duration from radio buttons
        const selectedDuration = document.querySelector('input[name="duration"]:checked');
        if (!selectedDuration) return;

        let duration;
        if (selectedDuration.value === 'custom') {
            duration = parseInt(this.customMinutes.value);
            if (isNaN(duration) || duration < 1 || duration > 60) {
                alert('Please enter a valid duration between 1 and 60 minutes');
                return;
            }
        } else {
            duration = parseInt(selectedDuration.value);
        }

        const wordGroup = document.getElementById('word-group').value;
        if (!sessionName || !wordGroup) {
            alert('Please fill in all required fields');
            return;
        }

        const session = {
            name: sessionName,
            duration: duration * 60, // Convert to seconds
            word_group: wordGroup,
            start_time: new Date().toISOString(),
            end_time: null,
            words_reviewed: [],
            correct_count: 0,
            wrong_count: 0
        };

        try {
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(session)
            });

            if (response.ok) {
                const newSession = await response.json();
                localStorage.setItem('current_session', JSON.stringify(newSession));
                hideModal();
                window.location.href = '/study';
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session. Please try again.');
        }
    }

    viewSession(id) {
        // Implement session detail view
        console.log('Viewing session:', id);
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }
}

// Add global functions for modal control
window.showModal = function() {
    document.getElementById('session-modal').style.display = 'block';
    document.getElementById('session-name').focus();
}

window.hideModal = function() {
    document.getElementById('session-modal').style.display = 'none';
}

// Make sure there's only one instance
if (window.sessionsManager) {
    window.sessionsManager = null;
}
window.sessionsManager = new SessionsManager();
