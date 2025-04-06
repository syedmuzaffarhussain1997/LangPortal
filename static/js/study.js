class StudyGame {
    constructor() {
        // Check for active session
        this.currentSession = JSON.parse(localStorage.getItem('current_session'));
        if (!this.currentSession) {
            window.location.href = '/sessions';
            return;
        }

        // Core game properties
        this.words = [];
        this.score = 0;
        this.gameActive = false;
        this.timer = this.currentSession.duration;
        this.wordsReviewed = [];
        this.fallingWords = new Map();
        this.fallSpeed = 5000; // Time to fall in ms
        this.spawnDelay = 2000; // Time between spawns in ms
        this.uniqueWordsMap = new Map(); // Track unique words and attempts

        this.initializeElements();
        this.addEventListeners();
        this.loadWords();
    }

    initializeElements() {
        this.wordInput = document.getElementById('word-input');
        this.wordContainer = document.getElementById('word-container');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.gameArea = document.getElementById('game-area');
        this.gameArea.style.display = 'block';

        // Add end game button
        const endButton = document.createElement('button');
        endButton.id = 'end-game';
        endButton.className = 'danger-button';
        endButton.style.cssText = 'position: absolute; top: 10px; right: 10px; z-index: 100;';
        endButton.textContent = 'End Game';
        this.gameArea.appendChild(endButton);
        this.endButton = endButton;
    }

    addEventListeners() {
        this.wordInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const input = this.wordInput.value.trim().toLowerCase();
                this.checkInput(input);
                this.wordInput.value = '';
            }
        });

        this.endButton.addEventListener('click', () => this.confirmEndGame());
    }

    async loadWords() {
        try {
            // Load all words first
            const response = await fetch('/api/words');
            const allWords = await response.json();
            
            // Filter words by group and remove duplicates
            const uniqueWords = this.filterUniqueWords(allWords);
            
            // Get only unused or least used words
            this.words = this.getUnusedWords(uniqueWords);
            
            if (this.words.length > 0) {
                this.startGame();
            } else {
                this.showNotification('No new words available', 'info');
            }
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }

    filterUniqueWords(words) {
        const seen = new Set();
        return words.filter(word => {
            if (seen.has(word.kanji)) {
                return false;
            }
            seen.add(word.kanji);
            return true;
        });
    }

    getUnusedWords(words) {
        // Get word usage history
        const history = JSON.parse(localStorage.getItem('wordHistory') || '{}');
        
        // Sort words by usage count
        return words.sort((a, b) => {
            const aCount = history[`word_${a.id}`]?.attempts?.length || 0;
            const bCount = history[`word_${b.id}`]?.attempts?.length || 0;
            return aCount - bCount;
        }).slice(0, 20); // Get top 20 least used words
    }

    startGame() {
        this.gameActive = true;
        this.wordInput.disabled = false;
        this.wordInput.focus();
        this.startTimer();
        this.spawnWords();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.timerElement.textContent = `${Math.floor(this.timer / 60)}:${(this.timer % 60).toString().padStart(2, '0')}`;
            if (this.timer <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    spawnWords() {
        if (!this.gameActive) return;
        this.spawnWord();
        this.spawnInterval = setInterval(() => {
            if (this.gameActive) {
                this.spawnWord();
            }
        }, this.spawnDelay);
    }

    spawnWord() {
        if (this.fallingWords.size >= 5) return;

        // Get unused words first
        const unusedWords = this.words.filter(word => 
            !Array.from(this.fallingWords.values()).some(fw => fw.word.id === word.id)
        );

        if (unusedWords.length === 0) return;

        const word = unusedWords[Math.floor(Math.random() * unusedWords.length)];
        const wordId = Date.now().toString();

        const element = document.createElement('div');
        element.className = 'falling-word';
        element.innerHTML = `<div class="kanji">${word.kanji}</div>`;
        element.style.left = `${Math.random() * (this.gameArea.clientWidth - 100)}px`;
        element.style.top = '-50px';

        this.wordContainer.appendChild(element);
        this.fallingWords.set(wordId, { element, word });

        element.style.transition = `top ${this.fallSpeed}ms linear`;
        setTimeout(() => element.style.top = '450px', 50);

        setTimeout(() => {
            if (this.fallingWords.has(wordId)) {
                this.fallingWords.delete(wordId);
                element.remove();
            }
        }, this.fallSpeed);
    }

    checkInput(input) {
        if (!this.gameActive) return;
        
        for (const [id, { element, word }] of this.fallingWords) {
            if (input === word.romaji && !element.classList.contains('matched')) {
                // Track word attempt in uniqueWordsMap
                if (!this.uniqueWordsMap.has(word.id)) {
                    this.uniqueWordsMap.set(word.id, {
                        word: word,
                        attempts: []
                    });
                }
                
                this.uniqueWordsMap.get(word.id).attempts.push({
                    input: input,
                    timestamp: new Date().toISOString(),
                    correct: true
                });

                // Update word history in localStorage
                this.updateWordHistory(word, true, input);
                
                // Mark word as matched to prevent double matching
                element.classList.add('matched');
                this.score += 10;
                this.scoreElement.textContent = this.score;
                
                // Update visuals
                element.classList.add('correct');
                setTimeout(() => {
                    this.fallingWords.delete(id);
                    element.remove();
                }, 300);

                // Track progress
                this.wordsReviewed.push({
                    word: word,
                    correct: true,
                    timestamp: new Date().toISOString(),
                    input: input
                });

                // Show feedback
                this.showFeedback('correct');
                return true;
            }
        }
        
        // If no match found
        for (const [_, { word }] of this.fallingWords) {
            if (input.length > 0) {
                // Track incorrect attempt
                if (!this.uniqueWordsMap.has(word.id)) {
                    this.uniqueWordsMap.set(word.id, {
                        word: word,
                        attempts: []
                    });
                }
                
                this.uniqueWordsMap.get(word.id).attempts.push({
                    input: input,
                    timestamp: new Date().toISOString(),
                    correct: false
                });

                // Update word history for incorrect attempt
                this.updateWordHistory(word, false, input);
                
                this.showFeedback('miss');
                this.wordsReviewed.push({
                    word: word,
                    correct: false,
                    timestamp: new Date().toISOString(),
                    input: input
                });
                break;
            }
        }
        
        return false;
    }

    updateWordHistory(word, isCorrect, input) {
        const wordHistory = JSON.parse(localStorage.getItem('wordHistory') || '{}');
        const wordKey = `word_${word.id}`;
        
        if (!wordHistory[wordKey]) {
            wordHistory[wordKey] = {
                kanji: word.kanji,
                romaji: word.romaji,
                english: word.english,
                firstSeen: new Date().toISOString(),
                attempts: []
            };
        }

        const attempt = {
            sessionId: this.currentSession.id,
            sessionName: this.currentSession.name,
            timestamp: new Date().toISOString(),
            input: input,
            correct: isCorrect
        };

        wordHistory[wordKey].attempts.push(attempt);
        localStorage.setItem('wordHistory', JSON.stringify(wordHistory));

        // Also save to server
        fetch('/api/word-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wordHistory)
        });
    }

    showFeedback(type) {
        const feedback = document.createElement('div');
        feedback.className = `feedback ${type}`;
        feedback.textContent = type === 'correct' ? '✓' : '✗';
        feedback.style.left = '50%';
        feedback.style.top = '50%';
        this.gameArea.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 500);
    }

    confirmEndGame() {
        if (confirm('Are you sure you want to end the game? Your progress will be saved.')) {
            this.endGame();
        }
    }

    endGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        clearInterval(this.spawnInterval);
        this.wordInput.disabled = true;

        // Calculate statistics
        const stats = this.calculateGameStats();
        
        const finalSession = {
            ...this.currentSession,
            end_time: new Date().toISOString(),
            score: this.score,
            words_reviewed: this.wordsReviewed,
            correct_count: stats.correctCount,
            wrong_count: stats.incorrectCount,
            completed: true
        };

        fetch('/api/sessions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalSession)
        }).then(() => {
            localStorage.removeItem('current_session');
            this.showGameOver(stats);
        });
    }

    calculateGameStats() {
        const correctWords = this.wordsReviewed.filter(w => w.correct);
        const incorrectWords = this.wordsReviewed.filter(w => !w.correct);
        
        return {
            correctCount: correctWords.length,
            incorrectCount: incorrectWords.length,
            totalAttempts: this.wordsReviewed.length,
            accuracy: Math.round((correctWords.length / (this.wordsReviewed.length || 1)) * 100),
            correctWords: correctWords,
            incorrectWords: incorrectWords
        };
    }

    showGameOver(stats) {
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        
        // Create detailed word review tables
        const correctWordsTable = this.createWordReviewTable(stats.correctWords, 'Correct');
        const incorrectWordsTable = this.createWordReviewTable(stats.incorrectWords, 'Incorrect');

        gameOver.innerHTML = `
            <h2>Game Over!</h2>
            <div class="stats">
                <p>Session: ${this.currentSession.name}</p>
                <p>Final Score: ${this.score}</p>
                <div class="word-stats">
                    <h3>Word Statistics:</h3>
                    <p>Total Words Attempted: ${stats.totalAttempts}</p>
                    <p class="correct-words">Correct Words: ${stats.correctCount}</p>
                    <p class="incorrect-words">Incorrect Words: ${stats.incorrectCount}</p>
                    <p>Accuracy: ${stats.accuracy}%</p>
                </div>
                <div class="word-review-section">
                    ${correctWordsTable}
                    ${incorrectWordsTable}
                </div>
            </div>
            <div class="game-over-buttons">
                <button onclick="window.location.href='/sessions'" class="secondary-button">View History</button>
                <button onclick="location.reload()" class="primary-button">Play Again</button>
            </div>
        `;
        this.gameArea.appendChild(gameOver);
    }

    createWordReviewTable(words, type) {
        if (words.length === 0) return '';
        
        // Convert uniqueWordsMap to array of unique words with their attempts
        const uniqueWords = Array.from(this.uniqueWordsMap.values());
        
        return `
            <div class="word-review-table ${type.toLowerCase()}-words">
                <h4>${type} Attempts</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Kanji</th>
                            <th>Correct Romaji</th>
                            <th>Your Input</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${uniqueWords.map(({ word, attempts }) => 
                            attempts
                                .filter(a => type === 'Correct' ? a.correct : !a.correct)
                                .map(attempt => `
                                    <tr>
                                        <td>${word.kanji}</td>
                                        <td>${word.romaji}</td>
                                        <td>${attempt.input}</td>
                                        <td>${new Date(attempt.timestamp).toLocaleTimeString()}</td>
                                    </tr>
                                `).join('')
                        ).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudyGame();
});
