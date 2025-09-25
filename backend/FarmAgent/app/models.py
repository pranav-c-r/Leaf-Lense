from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
class Farmer(BaseModel):
    id: str
    name: str
    phone: str = Field(..., description="Phone number of farmer in E.164 format")
    location: str
    crop: Optional[str] = "unknown"

class RiskAlert(BaseModel):
    farmer_id: str
    risk_type: str
    severity: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NotificationPayload(BaseModel):
    phone: str
    message: str

class User(BaseModel):
    id: int
    username: str
    email: str
    role: str = "admin" 
class APIResponse(BaseModel):
    status: str
    data: Optional[dict] = None
    errors: Optional[List[str]] = None
