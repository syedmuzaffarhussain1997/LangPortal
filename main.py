from fastapi import FastAPI
from flask import Flask, render_template, send_from_directory
from fastapi.middleware.wsgi import WSGIMiddleware
from routes.api import router
import uvicorn
import os

# Initialize FastAPI and Flask apps
api_app = FastAPI()
api_app.include_router(router)
flask_app = Flask(__name__)

# Flask routes for frontend
@flask_app.route('/')
def home():
    return render_template('dashboard.html')

@flask_app.route('/study')
def study():
    return render_template('study.html')

@flask_app.route('/sessions')
def sessions():
    return render_template('sessions.html')

@flask_app.route('/words')
def words():
    return render_template('words.html')

@flask_app.route('/settings')
def settings():
    return render_template('settings.html')

@flask_app.route('/word-history')
def word_history():
    return render_template('word_history.html')

@flask_app.route('/about')
def about():
    return render_template('about.html')

@flask_app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# Mount Flask app on FastAPI
api_app.mount("/", WSGIMiddleware(flask_app))

if __name__ == "__main__":
    uvicorn.run(api_app, host="127.0.0.1", port=8000)
