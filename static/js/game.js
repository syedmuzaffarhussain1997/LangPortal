// gameLogic.js

let currentWord = '';
let score = 0;
let isAnimating = false;

class WordGame {
    constructor() {
        this.wordContainer = document.getElementById('word-container');
        this.input = document.getElementById('word-input');
        this.score = 0;
        this.gameArea = document.querySelector('.game-area');
        this.fallSpeed = 3000; // 3 seconds to fall
        this.initialize();
    }

    initialize() {
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.spawnNewWord();
    }

    async getRandomWord() {
        // Replace with your actual word list or API call
        const words = ['漢字', '日本語', '学習', '言語', '練習'];
        return words[Math.floor(Math.random() * words.length)];
    }

    async spawnNewWord() {
        if (isAnimating) return;
        
        const word = await this.getRandomWord();
        currentWord = word;
        
        // Create new word element
        const wordElement = document.createElement('div');
        wordElement.className = 'falling-word';
        wordElement.textContent = word;
        
        // Set initial position
        wordElement.style.top = '-50px';
        wordElement.style.left = Math.random() * (this.gameArea.offsetWidth - 100) + 'px';
        
        this.wordContainer.appendChild(wordElement);
        
        // Start falling animation
        isAnimating = true;
        let startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = elapsed / this.fallSpeed;
            
            if (progress < 1) {
                const newTop = (this.gameArea.offsetHeight + 50) * progress;
                wordElement.style.top = newTop + 'px';
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.handleMissedWord();
            }
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }

    handleInput(event) {
        const input = event.target.value.trim();
        
        if (input === currentWord) {
            this.handleCorrectWord();
            event.target.value = '';
            event.target.classList.add('correct-input');
            setTimeout(() => event.target.classList.remove('correct-input'), 500);
        }
    }

    handleCorrectWord() {
        isAnimating = false;
        this.score += 10;
        this.updateScore();
        
        // Remove current word with fade out
        const wordElement = this.wordContainer.querySelector('.falling-word');
        if (wordElement) {
            wordElement.classList.add('word-correct');
            setTimeout(() => {
                wordElement.remove();
                this.spawnNewWord();
            }, 300);
        }
    }

    handleMissedWord() {
        isAnimating = false;
        this.score = Math.max(0, this.score - 5);
        this.updateScore();
        
        // Remove missed word
        const wordElement = this.wordContainer.querySelector('.falling-word');
        if (wordElement) {
            wordElement.classList.add('word-missed');
            setTimeout(() => {
                wordElement.remove();
                this.spawnNewWord();
            }, 300);
        }
    }

    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
}

// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new WordGame();
});