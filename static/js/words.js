class WordsManager {
    constructor() {
        this.initializeElements();
        this.loadWords();
        this.addEventListeners();
    }

    initializeElements() {
        this.wordsGrid = document.getElementById('words-grid');
        this.searchInput = document.getElementById('search-word');
        this.groupSelect = document.getElementById('group-select');
        this.wordForm = document.getElementById('word-form');
        this.modal = document.getElementById('word-modal');
        
        // Import/Export buttons
        this.importBtn = document.getElementById('import-words');
        this.exportBtn = document.getElementById('export-words');
        this.addWordBtn = document.getElementById('add-word-btn');
        this.lastUpdateTime = null;
        this.words = [];
    }

    async loadWords() {
        try {
            const response = await fetch('/api/words');
            this.words = await response.json();
            this.renderWords(this.filterWords());
        } catch (error) {
            console.error('Error loading words:', error);
            this.showNotification('Failed to load words', 'error');
        }
    }

    async addWord(wordData) {
        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wordData)
            });
            
            const newWord = await response.json();
            this.words.push(newWord);
            this.saveToLocalStorage();
            this.renderWords(this.filterWords());
            this.showNotification('Word added successfully', 'success');
            return newWord;
        } catch (error) {
            console.error('Error adding word:', error);
            this.showNotification('Failed to add word', 'error');
            throw error;
        }
    }

    async updateWord(id, wordData) {
        try {
            const response = await fetch(`/api/words/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(wordData)
            });
            
            const updatedWord = await response.json();
            this.words = this.words.map(w => w.id === id ? updatedWord : w);
            this.saveToLocalStorage();
            this.renderWords(this.filterWords());
            this.showNotification('Word updated successfully', 'success');
        } catch (error) {
            console.error('Error updating word:', error);
            this.showNotification('Failed to update word', 'error');
        }
    }

    async deleteWord(id) {
        if (!confirm('Are you sure you want to delete this word?')) return;
        
        try {
            await fetch(`/api/words/${id}`, { method: 'DELETE' });
            this.words = this.words.filter(w => w.id !== id);
            this.saveToLocalStorage();
            this.renderWords(this.filterWords());
            this.showNotification('Word deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting word:', error);
            this.showNotification('Failed to delete word', 'error');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = {
            kanji: document.getElementById('word-kanji').value,
            romaji: document.getElementById('word-romaji').value,
            english: document.getElementById('word-english').value,
            group: document.getElementById('word-group').value
        };

        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to add word');
            }

            const newWord = await response.json();
            this.words.push(newWord);
            this.renderWords(this.words);
            this.modal.style.display = 'none';
            this.wordForm.reset();
            this.showNotification('Word added successfully', 'success');
        } catch (error) {
            console.error('Error saving word:', error);
            this.showNotification('Failed to save word', 'error');
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('words', JSON.stringify(this.words));
        localStorage.setItem('wordsLastUpdate', new Date().toISOString());
    }

    renderWords(words) {
        // Render Grid View
        this.wordsGrid.innerHTML = words.map(word => this.renderWordCard(word)).join('');
        
        // Render Table View
        const tableBody = document.getElementById('words-table-body');
        if (tableBody) {
            tableBody.innerHTML = words.map(word => this.renderTableRow(word)).join('');
        }
    }

    renderWordCard(word) {
        return `
            <div class="word-card" data-id="${word.id}">
                <div class="word-main">
                    <h3 class="word-kanji">${word.kanji}</h3>
                    <p class="word-romaji">${word.romaji}</p>
                    <p class="word-english">${word.english}</p>
                    <p class="word-group">${word.group}</p>
                </div>
                <div class="word-stats">
                    <span class="correct-count">✓ ${word.correct_count || 0}</span>
                    <span class="wrong-count">✗ ${word.wrong_count || 0}</span>
                </div>
                <div class="word-actions">
                    <button onclick="wordsManager.showWordModal(${word.id})" class="secondary-button">
                        <span class="icon">✎</span> Edit
                    </button>
                    <button onclick="wordsManager.deleteWord(${word.id})" class="danger-button">
                        <span class="icon">🗑️</span> Delete
                    </button>
                </div>
            </div>
        `;
    }

    renderTableRow(word) {
        return `
            <tr data-id="${word.id}">
                <td>${word.kanji}</td>
                <td>${word.romaji}</td>
                <td>${word.english}</td>
                <td>${word.group}</td>
                <td>${word.correct_count || 0}</td>
                <td>${word.wrong_count || 0}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="wordsManager.editWord(${word.id})" class="secondary-button">
                            <span class="icon">✎</span>
                        </button>
                        <button onclick="wordsManager.deleteWord(${word.id})" class="danger-button">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    editWord(id) {
        const word = this.words.find(w => w.id === id);
        if (word) {
            this.showWordModal(word);
        }
    }

    filterWords() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const group = this.groupSelect.value;
        
        return this.words.filter(word => {
            const matchesSearch = word.kanji.toLowerCase().includes(searchTerm) ||
                                word.romaji.toLowerCase().includes(searchTerm) ||
                                word.english.toLowerCase().includes(searchTerm);
            const matchesGroup = !group || word.group === group;
            return matchesSearch && matchesGroup;
        });
    }

    showWordModal(word = null) {
        const modalTitle = document.getElementById('modal-title');
        modalTitle.textContent = word ? 'Edit Word' : 'Add New Word';
        
        if (word) {
            // Check if word is a string (from JSON.stringify) and parse it
            if (typeof word === 'string') {
                try {
                    word = JSON.parse(word);
                } catch (e) {
                    console.error('Error parsing word data:', e);
                    return;
                }
            }
            
            document.getElementById('word-kanji').value = word.kanji || '';
            document.getElementById('word-romaji').value = word.romaji || '';
            document.getElementById('word-english').value = word.english || '';
            document.getElementById('word-group').value = word.group || 'Core Verbs';
            this.wordForm.dataset.editId = word.id;
        } else {
            this.wordForm.reset();
            delete this.wordForm.dataset.editId;
        }
        
        this.modal.style.display = 'block';
        document.getElementById('word-kanji').focus();
    }

    addEventListeners() {
        // Form submission
        this.wordForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Add word button
        this.addWordBtn.addEventListener('click', () => {
            this.modal.style.display = 'block';
            this.wordForm.reset();
            delete this.wordForm.dataset.editId;
        });

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });

        // Search and filter
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.renderWords(this.filterWords()));
        }
        if (this.groupSelect) {
            this.groupSelect.addEventListener('change', () => this.renderWords(this.filterWords()));
        }

        // View toggle
        document.getElementById('grid-view')?.addEventListener('click', () => this.toggleView('grid'));
        document.getElementById('table-view')?.addEventListener('click', () => this.toggleView('table'));
        
        // Add periodic sync
        setInterval(() => this.syncWithServer(), 30000); // Sync every 30 seconds

        // Add file import listeners
        document.getElementById('import-json').addEventListener('click', () => {
            this.initiateFileUpload('.json');
        });

        document.getElementById('import-excel').addEventListener('click', () => {
            this.initiateFileUpload('.xlsx,.xls,.csv');
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Fix template download button listener
        document.getElementById('download-template').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/vocabulary-template');
                if (!response.ok) throw new Error('Failed to fetch template');
                
                const template = await response.json();
                const blob = new Blob([JSON.stringify(template, null, 2)], 
                    { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vocabulary_template.json';
                a.click();
                URL.revokeObjectURL(url);
                
                this.showNotification('Template downloaded successfully', 'success');
            } catch (error) {
                console.error('Error downloading template:', error);
                this.showNotification('Failed to download template', 'error');
            }
        });

        // Add template download button listener
        document.getElementById('download-template').addEventListener('click', () => {
            fetch('/data/vocabulary_template.json')
                .then(response => response.json())
                .then(template => {
                    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'vocabulary_template.json';
                    a.click();
                    URL.revokeObjectURL(url);
                });
        });

        // Download JSON template button
        document.getElementById('download-template').addEventListener('click', async () => {
            try {
                const response = await fetch('/api/vocabulary-template');
                if (!response.ok) throw new Error('Failed to fetch template');
                
                const template = await response.json();
                const blob = new Blob([JSON.stringify(template, null, 2)], 
                    { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'vocabulary_template.json';
                a.click();
                URL.revokeObjectURL(url);
                
                this.showNotification('Template downloaded successfully', 'success');
            } catch (error) {
                console.error('Error downloading template:', error);
                this.showNotification('Failed to download template', 'error');
            }
        });

        // Download Excel template button
        document.getElementById('download-excel-template').addEventListener('click', () => {
            const headers = ['kanji', 'romaji', 'english', 'group'];
            const sampleData = [
                ['新しい', 'atarashii', 'new', 'Core Adjectives'],
                ['食べ物', 'tabemono', 'food', 'Basic Nouns']
            ];
            
            let csvContent = headers.join(',') + '\n';
            sampleData.forEach(row => {
                csvContent += row.join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'vocabulary_template.csv';
            a.click();
            URL.revokeObjectURL(url);
            
            this.showNotification('Excel template downloaded successfully', 'success');
        });
    }

    initiateFileUpload(acceptTypes) {
        const fileInput = document.getElementById('file-input');
        fileInput.accept = acceptTypes;
        fileInput.click();
    }

    async handleFileUpload(file) {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/words/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to import file');

            const result = await response.json();
            this.showNotification(`Successfully imported ${result.words.length} words`, 'success');
            
            // Refresh the word list
            await this.loadWords();
        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification('Error processing file', 'error');
        }
    }

    async handleJsonFile(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const words = JSON.parse(e.target.result);
                await this.processWords(words);
            } catch (error) {
                this.showNotification('Invalid JSON format', 'error');
            }
        };
        reader.readAsText(file);
    }

    async handleExcelFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/words/import', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to import file');

            const result = await response.json();
            await this.processWords(result.words);
        } catch (error) {
            this.showNotification('Failed to process Excel file', 'error');
        }
    }

    async processWords(words) {
        if (!Array.isArray(words)) {
            words = [words];
        }

        let added = 0;
        let errors = 0;

        for (const word of words) {
            if (this.validateWord(word)) {
                try {
                    await this.addWord(word);
                    added++;
                } catch (error) {
                    errors++;
                }
            } else {
                errors++;
            }
        }

        this.showNotification(
            `Added ${added} words${errors > 0 ? `, ${errors} failed` : ''}`,
            errors > 0 ? 'warning' : 'success'
        );

        // Refresh the word list
        await this.loadWords();
    }

    validateWord(word) {
        return word.kanji && 
               word.romaji && 
               word.english && 
               word.group && 
               typeof word.kanji === 'string' &&
               typeof word.romaji === 'string' &&
               typeof word.english === 'string' &&
               typeof word.group === 'string';
    }

    async syncWithServer() {
        try {
            const response = await fetch('/api/words');
            const serverWords = await response.json();
            
            // Compare timestamps and merge if needed
            const lastUpdate = localStorage.getItem('wordsLastUpdate');
            if (lastUpdate) {
                const localDate = new Date(lastUpdate);
                const serverDate = new Date(serverWords.lastUpdate || 0);
                
                if (serverDate > localDate) {
                    this.words = serverWords;
                    this.saveToLocalStorage();
                    this.renderWords(this.filterWords());
                }
            }
        } catch (error) {
            console.error('Error syncing with server:', error);
        }
    }

    toggleView(view) {
        const gridView = document.getElementById('words-grid');
        const tableView = document.getElementById('words-table-container');
        const gridButton = document.getElementById('grid-view');
        const tableButton = document.getElementById('table-view');

        if (view === 'grid') {
            gridView.style.display = 'grid';
            tableView.style.display = 'none';
            gridButton.classList.add('active');
            tableButton.classList.remove('active');
        } else {
            gridView.style.display = 'none';
            tableView.style.display = 'block';
            gridButton.classList.remove('active');
            tableButton.classList.add('active');
        }
    }

    importWords() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async event => {
                try {
                    const words = JSON.parse(event.target.result);
                    if (Array.isArray(words)) {
                        for (const word of words) {
                            await this.addWord(word);
                        }
                    }
                } catch (error) {
                    this.showNotification('Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    exportWords() {
        const data = JSON.stringify(this.words, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabulary-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // ... add more methods for CRUD operations ...
}

// Initialize manager
document.addEventListener('DOMContentLoaded', () => {
    window.wordsManager = new WordsManager();
});
