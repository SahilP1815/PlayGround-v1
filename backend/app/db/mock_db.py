import json
import os
from datetime import datetime

MOCK_FILE = "mock_data.json"

class MockDB:
    @staticmethod
    def _load():
        if not os.path.exists(MOCK_FILE):
            return {"bookings": [], "slots": [], "users": []}
        with open(MOCK_FILE, "r") as f:
            data = json.load(f)
            if "users" not in data:
                data["users"] = []
            return data

    @classmethod
    def add_user(cls, user_dict):
        data = cls._load()
        data["users"].append(user_dict)
        cls._save(data)
        return user_dict

    @classmethod
    def get_user_by_email(cls, email):
        data = cls._load()
        return next((u for u in data["users"] if u["email"] == email), None)

    @classmethod
    def get_user_bookings(cls, user_id):
        data = cls._load()
        return [b for b in data["bookings"] if b["user_id"] == user_id]

    @classmethod
    def update_slot_status(cls, slot_id, status):
        # In mock mode, we just record that it's booked
        pass
