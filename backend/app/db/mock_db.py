import json
import os
from datetime import datetime

MOCK_FILE = "mock_data.json"

class MockDB:
    @staticmethod
    def _load():
        if not os.path.exists(MOCK_FILE):
            return {"bookings": [], "slots": []}
        with open(MOCK_FILE, "r") as f:
            return json.load(f)

    @staticmethod
    def _save(data):
        with open(MOCK_FILE, "w") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def add_booking(cls, booking_dict):
        data = cls._load()
        data["bookings"].append(booking_dict)
        cls._save(data)
        return booking_dict

    @classmethod
    def get_user_bookings(cls, user_id):
        data = cls._load()
        return [b for b in data["bookings"] if b["user_id"] == user_id]

    @classmethod
    def update_slot_status(cls, slot_id, status):
        # In mock mode, we just record that it's booked
        pass
