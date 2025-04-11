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

### Backend
- Python 3.x

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

## 1. Application Setup 🚀
```python
# Initialize FastAPI and Flask apps
from fastapi import FastAPI
from flask import Flask, render_template, send_from_directory

api_app = FastAPI()
api_app.include_router(router)
flask_app = Flask(__name__)
```

## 2. Route Management 🛣️
```python
# Core route definitions
@flask_app.route('/')
def home():
    return render_template('dashboard.html')

@flask_app.route('/study')
def study():
    return render_template('study.html')
```

## 3. Static File Handling 📁
```python
@flask_app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)
```

## 4. Server Configuration ⚙️
```python
if __name__ == "__main__":
    uvicorn.run(api_app, host="127.0.0.1", port=8000)
```

## Available Routes 🗺️

| Route | Description | Template |
|-------|-------------|----------|
| `/` | Main Dashboard | `dashboard.html` |
| `/study` | Study Interface | `study.html` |
| `/sessions` | Session Management | `sessions.html` |
| `/words` | Word Management | `words.html` |
| `/settings` | Settings Panel | `settings.html` |
| `/word-history` | Word History | `word_history.html` |
| `/about` | About Page | `about.html` |


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

Try LangPortal live on Replit 

[![Run on Replit](https://replit.com/badge/github/muzaffarcodes/LangPortal)](https://replit.com/@muzaffarcodes/LangPortal)


### Running Locally
1. Clone repository:
```bash
git clone https://github.com/syedmuzaffarhussain1997/LangPortal.git
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

5. Access at: `http://localhost:8000`

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

## Let's Connect 🌐

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://pk.linkedin.com/in/muzaffarhussain1)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/MuzaffarCodes)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/syedmuzaffarhussain1997)

</div>

### Professional Profile 👨‍💻

I’m a dedicated developer with a passion for creating innovative solutions and advancing technology. Explore my work and connect with me to discuss projects, opportunities, or ideas!

- **Online Resume** 🌐 Discover my projects and achievements at [muzaffardev.netlify.app](https://muzaffardev.netlify.app)
- **Email** 📬 Reach me directly at [muzaffar.ai.engineer@gmail.com](mailto:muzaffar.ai.engineer@gmail.com)


---

Developed with ❤️ by Muzaffar Hussain | [GitHub](https://github.com/syedmuzaffarhussain1997)
