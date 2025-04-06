import json
from pathlib import Path
from typing import Dict, List, Any

class LocalStorage:
    def __init__(self):
        self.storage_path = Path("data")
        self.storage_path.mkdir(exist_ok=True)

    def save_data(self, key: str, data: Any) -> None:
        file_path = self.storage_path / f"{key}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def load_data(self, key: str) -> Any:
        file_path = self.storage_path / f"{key}.json"
        if not file_path.exists():
            return None
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def clear_data(self, key: str) -> None:
        file_path = self.storage_path / f"{key}.json"
        if file_path.exists():
            file_path.unlink()
