# LangPortal - Interactive Language Learning Platform

## Overview 🌟
LangPortal is a modern, gamified web application crafted to transform language learning into an engaging and effective experience. With a special focus on Japanese, it features an interactive falling Kanji game where users type Romaji to match characters and earn points.

**"Master languages the fun way – starting with Japanese!"**

## Features 🚀

### Interactive Study Sessions
- **Dynamic Word Practice:** Real-time engagement with instant feedback
- **Falling Kanji Game:** Match Kanji characters by typing Romaji
- **Session Analytics:** Detailed performance tracking and insights

### Vocabulary Management
- **CRUD Operations:** Easy vocabulary management
- **Custom Grouping:** Personalized word categorization
- **Import/Export:** Support for JSON and Excel formats

### Progress Tracking
- **Learning Statistics:** Comprehensive growth metrics
- **Performance Analytics:** Detailed progress insights
- **History Tracking:** Session review capabilities

## Tech Stack 🛠️

### Frontend
- HTML5
- CSS3 (Custom Properties)
- JavaScript (ES6+)
- Material Icons

### Backend
- Python 3.x
- Flask Framework
- RESTful API

### Storage
- JSON File System
- LocalStorage (client-side)

## Project Structure 📁
```
LangPortal/
├── static/
│   ├── css/
│   │   └── style.css         # Custom styles
│   └── js/
│       ├── study.js         # Study logic
│       ├── words.js         # Vocabulary management
│       └── settings.js      # Theme controls
├── templates/
│   ├── base.html           # Base template
│   ├── study.html          # Study interface
│   └── words.html          # Vocabulary interface
├── routes/
│   └── api.py              # API endpoints
└── app.py                  # Main application
```

## Core Components 🎯

### Study Game Engine
```javascript
class StudyGame {
    // Falling Kanji game mechanics
    // Real-time scoring system
    // Performance tracking
}
```

### Vocabulary Manager
```javascript
class WordsManager {
    // CRUD operations
    // Data import/export
    // Search functionality
}
```

## Running the Application 🚀

### Running on Replit
1. Create new Python Repl
2. Upload project files
3. Install dependencies:
```bash
pip install -r requirements.txt
```
4. Click "Run" or execute:
```bash
python app.py
```

### Running Locally
1. Clone repository:
```bash
git clone https://github.com/yourusername/LangPortal.git
cd LangPortal
```

2. Create virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run application:
```bash
python app.py
```

5. Access at: `http://localhost:5000`

## Development Journey 💡

### Methodology
- **Vibe Coding:** Flow-state development approach
- **Prompt Engineering:** AI-assisted development
- **Iterative Design:** Continuous improvement cycle

### Time Investment
- Multiple development sprints
- Focus on user experience
- Continuous testing and refinement

## Responsive Design 📱
- Desktop-first approach
- Mobile-optimized interface
- Fluid layouts (CSS Grid/Flexbox)
- Touch-friendly controls

## Theme Support 🎨
- Light/Dark modes
- System preference detection
- Custom color schemes
- Smooth transitions

## Future Roadmap 🔮
1. Additional language support
2. Advanced analytics dashboard
3. Social learning features
4. Mobile application
5. Cloud synchronization

---

Developed with ❤️ by Muzaffar Hussain | [GitHub](https://github.com/syedmuzaffarhussain1997)
