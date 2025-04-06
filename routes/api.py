from fastapi import APIRouter, HTTPException, Body, File, UploadFile
from typing import List, Dict
import json
from models.word import Word
from models.session import Session
from utils.storage import LocalStorage
from datetime import datetime
import pandas as pd
import io

router = APIRouter()
storage = LocalStorage()

@router.get("/api/dashboard")
async def get_dashboard():
    sessions = storage.load_data("sessions") or []
    words = storage.load_data("words") or []
    total_sessions = len(sessions)
    correct_words = sum(session["correct_count"] for session in sessions)
    incorrect_words = sum(session["wrong_count"] for session in sessions)
    
    return {
        "study_sessions": total_sessions,
        "correct_words": correct_words,
        "incorrect_words": incorrect_words,
        "progress": min(100, (len(words) / 100) * 100),
        "success_rate": round((correct_words / (correct_words + incorrect_words or 1)) * 100),
        "study_streak": calculate_streak(sessions)
    }

def calculate_streak(sessions):
    if not sessions:
        return 0
    # Simple streak calculation - consecutive days
    streak = 0
    current_date = datetime.now().date()
    for session in sorted(sessions, key=lambda x: x['start_time'], reverse=True):
        session_date = datetime.fromisoformat(session['start_time']).date()
        if (current_date - session_date).days == streak:
            streak += 1
        else:
            break
    return streak

@router.get("/api/words")
async def get_words():
    try:
        with open("data/sample_words.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data["words"]
    except Exception as e:
        print(f"Error loading words: {e}")
        return []

@router.post("/api/words")
async def add_word(word: dict = Body(...)):
    try:
        # Load existing words
        with open("data/sample_words.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Generate new ID
        max_id = max([w["id"] for w in data["words"]], default=0)
        word["id"] = max_id + 1
        
        # Add default counts if not present
        word["correct_count"] = word.get("correct_count", 0)
        word["wrong_count"] = word.get("wrong_count", 0)
        
        # Add word to list
        data["words"].append(word)
        
        # Save back to file
        with open("data/sample_words.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        return word
    except Exception as e:
        print(f"Error adding word: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/words/{word_id}")
async def update_word(word_id: int, word: dict = Body(...)):
    words = storage.load_data("words") or []
    for i, w in enumerate(words):
        if w["id"] == word_id:
            words[i] = {**w, **word}
            break
    storage.save_data("words", words)
    return word

@router.delete("/api/words/{word_id}")
async def delete_word(word_id: int):
    try:
        with open("data/sample_words.json", 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data["words"] = [w for w in data["words"] if w["id"] != word_id]
        
        with open("data/sample_words.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        return {"status": "success"}
    except Exception as e:
        print(f"Error deleting word: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/words/import")
async def import_words(file: UploadFile = File(...)):
    try:
        content = await file.read()
        
        if file.filename.endswith('.json'):
            data = json.loads(content.decode())
            words = data.get('words', [])
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
            words = df.to_dict('records')
        elif file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
            words = df.to_dict('records')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        # Load existing words
        with open("data/sample_words.json", 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
        
        # Get max ID
        max_id = max([w["id"] for w in existing_data["words"]], default=0)
        
        # Process and add new words
        for word in words:
            max_id += 1
            word["id"] = max_id
            word["correct_count"] = word.get("correct_count", 0)
            word["wrong_count"] = word.get("wrong_count", 0)
            existing_data["words"].append(word)

        # Save updated words
        with open("data/sample_words.json", 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)

        return {"status": "success", "words": words}
    
    except Exception as e:
        print(f"Error importing words: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/words-group")
async def get_word_groups():
    return ["Core Verbs", "Core Adjectives", "Basic Nouns"]

@router.get("/api/sessions")
async def get_sessions():
    return storage.load_data("sessions") or []

@router.post("/api/sessions")
async def create_session(session: dict = Body(...)):
    sessions = storage.load_data("sessions") or []
    session["id"] = len(sessions) + 1
    session["start_time"] = datetime.now().isoformat()
    session["end_time"] = None
    sessions.append(session)
    storage.save_data("sessions", sessions)
    return session

@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: int):
    try:
        sessions = storage.load_data("sessions") or []
        
        # Find the session index
        session_index = None
        for i, session in enumerate(sessions):
            if session.get("id") == session_id:
                session_index = i
                break
        
        if session_index is None:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Remove the session
        sessions.pop(session_index)
        storage.save_data("sessions", sessions)
        
        return {"status": "success", "message": "Session deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/api/sessions")
async def update_session(session: dict = Body(...)):
    sessions = storage.load_data("sessions") or []
    for i, s in enumerate(sessions):
        if s["id"] == session["id"]:
            sessions[i] = session
            break
    storage.save_data("sessions", sessions)
    return session

@router.get("/api/study-activities")
async def get_study_activities():
    return []

@router.get("/api/settings")
async def get_settings():
    return {
        "theme": "light",
        "text_color": "#000000"
    }

@router.post("/api/launch")
async def launch_game(word_group: dict = Body(...)):
    words = storage.load_data("words")
    if not words:
        with open("data/sample_words.json", 'r', encoding='utf-8') as f:
            words = json.load(f)["words"]
        storage.save_data("words", words)
    
    group_words = [w for w in words if w["group"] == word_group["word_group"]]
    if not group_words:
        raise HTTPException(status_code=404, detail="Word group not found")
    
    return {"status": "started", "word_group": word_group["word_group"], "words": group_words}

@router.get("/api/word-history")
async def get_word_history():
    return storage.load_data("word_history") or {}

@router.post("/api/word-history")
async def save_word_history(history: dict = Body(...)):
    storage.save_data("word_history", history)
    return {"status": "success"}

@router.delete("/api/word-history/{word_id}")
async def delete_word_history(word_id: str):
    history = storage.load_data("word_history") or {}
    if word_id in history:
        del history[word_id]
        storage.save_data("word_history", history)
    return {"status": "success"}

@router.get("/api/vocabulary-template")
async def get_vocabulary_template():
    try:
        with open("data/vocabulary_template.json", 'r', encoding='utf-8') as f:
            template = json.load(f)
            return template
    except Exception as e:
        print(f"Error loading template: {e}")
        raise HTTPException(status_code=500, detail=str(e))
