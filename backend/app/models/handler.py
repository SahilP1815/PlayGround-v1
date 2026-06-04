from beanie import Document
from pydantic import Field
from enum import Enum
from datetime import datetime
from typing import List, Optional

class HandlerRole(str, Enum):
    MANAGER = "manager"
    SUPERVISOR = "supervisor"

class Handler(Document):
    """Represents a handler/manager assigned to one or more venues"""
    
    user_id: str  # Link to User document (the person managing)
    owner_id: str  # Which owner assigned this handler
    
    name: str
    email: str
    phone: Optional[str] = None
    
    # Venues this handler manages
    assigned_venues: List[str] = []  # List of ground_ids
    
    # Role and permissions
    role: HandlerRole = HandlerRole.MANAGER
    
    # Permissions
    can_confirm_bookings: bool = True
    can_cancel_bookings: bool = True
    can_view_analytics: bool = True
    can_edit_venue_details: bool = False  # Only owner can edit core details
    can_add_time_slots: bool = True
    can_manage_pricing: bool = True
    
    # Status
    is_active: bool = True
    assigned_at: datetime = Field(default_factory=datetime.utcnow)
    revoked_at: Optional[datetime] = None
    
    class Settings:
        name = "handlers"
        indexes = [
            "user_id",
            "owner_id",
        ]
