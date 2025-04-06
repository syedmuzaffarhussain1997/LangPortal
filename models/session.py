from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Session(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]
    words_reviewed: List[dict]
    correct_count: int = 0
    wrong_count: int = 0
