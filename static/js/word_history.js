class WordHistory {
    constructor() {
        this.initializeElements();
        this.loadHistory();
    }

    initializeElements() {
        this.historyList = document.getElementById('word-history-list');
        this.sessionFilter = document.getElementById('session-filter');
        this.accuracyFilter = document.getElementById('accuracy-filter');
        this.addEventListeners();
        this.loadSessions();
    }

    async loadHistory() {
        try {
            // Load from both localStorage and server
            const localHistory = JSON.parse(localStorage.getItem('wordHistory') || '{}');
            const response = await fetch('/api/word-history');
            const serverHistory = await response.json();
            
            // Merge histories, preferring local data
            this.history = { ...serverHistory, ...localHistory };
            this.renderHistory();
        } catch (error) {
            console.error('Error loading word history:', error);
        }
    }

    async loadSessions() {
        try {
            const response = await fetch('/api/sessions');
            const sessions = await response.json();
            this.sessionFilter.innerHTML = `
                <option value="">All Sessions</option>
                ${sessions.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            `;
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    renderHistory() {
        const filtered = this.filterHistory();
        const sorted = Object.entries(filtered).sort((a, b) => 
            new Date(b[1].firstSeen) - new Date(a[1].firstSeen)
        );

        this.historyList.innerHTML = sorted.map(([wordId, data]) => `
            <div class="word-card">
                <div class="word-header">
                    <div class="word-info">
                        <h3>${data.kanji}</h3>
                        <p class="romaji">${data.romaji}</p>
                        <p class="english">${data.english}</p>
                    </div>
                    <div class="word-stats">
                        <p>Accuracy: ${this.calculateAccuracy(data.attempts)}%</p>
                        <button onclick="wordHistory.deleteWord('${wordId}')" class="danger-button">Delete</button>
                    </div>
                </div>
                <div class="attempts-list">
                    ${this.renderAttempts(data.attempts)}
                </div>
            </div>
        `).join('');
    }

    renderAttempts(attempts) {
        return attempts.map(attempt => `
            <div class="attempt ${attempt.correct ? 'correct' : 'incorrect'}">
                <span class="session-name">${attempt.sessionName}</span>
                <span class="input">${attempt.input}</span>
                <span class="time">${new Date(attempt.timestamp).toLocaleString()}</span>
                <button onclick="wordHistory.deleteAttempt('${attempt.timestamp}')" class="delete-btn">×</button>
            </div>
        `).join('');
    }

    filterHistory() {
        const sessionId = this.sessionFilter.value;
        const accuracy = this.accuracyFilter.value;
        
        return Object.fromEntries(
            Object.entries(this.history).map(([id, data]) => [
                id,
                {
                    ...data,
                    attempts: data.attempts.filter(a => {
                        const matchesSession = !sessionId || a.sessionId.toString() === sessionId;
                        const matchesAccuracy = !accuracy || 
                            (accuracy === 'correct' && a.correct) || 
                            (accuracy === 'incorrect' && !a.correct);
                        return matchesSession && matchesAccuracy;
                    })
                }
            ]).filter(([_, data]) => data.attempts.length > 0)
        );
    }

    calculateAccuracy(attempts) {
        const correct = attempts.filter(a => a.correct).length;
        return Math.round((correct / attempts.length || 1) * 100);
    }

    async deleteWord(wordId) {
        if (!confirm('Delete all history for this word?')) return;
        
        delete this.history[wordId];
        localStorage.setItem('wordHistory', JSON.stringify(this.history));
        
        await fetch(`/api/word-history/${wordId}`, { method: 'DELETE' });
        this.renderHistory();
    }

    deleteAttempt(timestamp) {
        if (!confirm('Delete this attempt?')) return;
        
        Object.keys(this.history).forEach(wordId => {
            this.history[wordId].attempts = this.history[wordId].attempts
                .filter(a => a.timestamp !== timestamp);
            
            if (this.history[wordId].attempts.length === 0) {
                delete this.history[wordId];
            }
        });
        
        localStorage.setItem('wordHistory', JSON.stringify(this.history));
        fetch('/api/word-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.history)
        });
        
        this.renderHistory();
    }

    addEventListeners() {
        this.sessionFilter.addEventListener('change', () => this.renderHistory());
        this.accuracyFilter.addEventListener('change', () => this.renderHistory());
    }
}

const wordHistory = new WordHistory();
