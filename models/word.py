from pydantic import BaseModel
from typing import Optional

class Word(BaseModel):
    id: int
    kanji: str
    romaji: str
    english: str
    group: str
    correct_count: int = 0
    wrong_count: int = 0
