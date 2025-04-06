class VocabularyManager {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('vocabulary-file');
        const uploadBtn = document.getElementById('upload-btn');
        
        if (fileInput && uploadBtn) {
            uploadBtn.addEventListener('click', () => this.handleFileUpload(fileInput));
        }
    }

    async handleFileUpload(fileInput) {
        try {
            const file = fileInput.files[0];
            if (!file) {
                throw new Error('No file selected');
            }

            const data = await this.readFile(file);
            const parsedData = this.parseFileData(file.name, data);
            
            // Store in localStorage
            this.saveToLocalStorage(parsedData);
            
            // Update UI
            this.displaySuccess('File uploaded successfully');
            this.refreshWordList(parsedData);

        } catch (error) {
            this.displayError(`Upload failed: ${error.message}`);
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('File read failed'));
            
            if (file.name.endsWith('.json')) {
                reader.readAsText(file);
            } else if (file.name.match(/\.(xls|xlsx)$/i)) {
                reader.readAsBinaryString(file);
            } else {
                reject(new Error('Unsupported file format'));
            }
        });
    }

    parseFileData(filename, data) {
        try {
            if (filename.endsWith('.json')) {
                return JSON.parse(data);
            } else if (filename.match(/\.(xls|xlsx)$/i)) {
                // Add Excel parsing logic here if needed
                throw new Error('Excel support coming soon');
            }
        } catch (error) {
            throw new Error('Invalid file format');
        }
    }

    saveToLocalStorage(data) {
        try {
            localStorage.setItem('vocabulary', JSON.stringify(data));
        } catch (error) {
            throw new Error('Failed to save to local storage');
        }
    }

    refreshWordList(words) {
        const wordList = document.getElementById('word-list');
        if (!wordList) return;

        wordList.innerHTML = words.map(word => `
            <div class="word-card">
                <h3>${word.kanji}</h3>
                <p>${word.romaji}</p>
                <p>${word.english}</p>
                <span class="group-tag">${word.group}</span>
            </div>
        `).join('');
    }

    displaySuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.textContent = message;
        this.showAlert(alert);
    }

    displayError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = message;
        this.showAlert(alert);
    }

    showAlert(alertElement) {
        const container = document.querySelector('.vocabulary-container');
        if (!container) return;

        container.insertBefore(alertElement, container.firstChild);
        setTimeout(() => alertElement.remove(), 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyManager();
});
