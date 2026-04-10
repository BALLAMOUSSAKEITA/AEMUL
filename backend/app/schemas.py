import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


# ── Members ──────────────────────────────────────────────────────────────────

class MemberCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    program: str
    study_level: str = "baccalaureat"
    gender: str = "frere"
    photo_base64: str | None = None


class MemberUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    program: str | None = None
    study_level: str | None = None
    photo_base64: str | None = None
    is_active: bool | None = None


class MemberProfileUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    program: str | None = None
    study_level: str | None = None
    photo_base64: str | None = None


class MemberOut(BaseModel):
    id: uuid.UUID
    member_number: str
    first_name: str
    last_name: str
    email: str
    phone: str
    program: str
    study_level: str
    gender: str = "frere"
    photo_base64: str | None = None
    is_active: bool
    is_approved: bool
    must_change_password: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MemberCardData(BaseModel):
    id: uuid.UUID
    member_number: str
    first_name: str
    last_name: str
    program: str
    photo_base64: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MemberRegistrationResult(BaseModel):
    member: MemberOut
    generated_password: str


class MemberLogin(BaseModel):
    email: EmailStr
    password: str


class MemberChangePassword(BaseModel):
    new_password: str


class MemberToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    must_change_password: bool = False
    is_approved: bool = False


# ── Events ────────────────────────────────────────────────────────────────────

class EventCreate(BaseModel):
    title: str
    description: str | None = None
    date: datetime
    location: str | None = None
    is_published: bool = True


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date: datetime | None = None
    location: str | None = None
    is_published: bool | None = None


class EventOut(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    date: datetime
    location: str | None = None
    is_published: bool
    created_by: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Auth ─────────────────────────────────────────────────────────────────────

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class AdminOut(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Stats ────────────────────────────────────────────────────────────────────

class MemberStats(BaseModel):
    total_members: int
    active_members: int
    inactive_members: int
    recent_registrations: int
    pending_approvals: int


# ── Event Registrations ─────────────────────────────────────────────────────

class EventRegistrationOut(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    member_id: uuid.UUID
    member_name: str = ""
    member_email: str = ""
    member_gender: str = ""
    created_at: datetime


class EventWithRegistrations(EventOut):
    registration_count: int = 0


# ── Ideas ────────────────────────────────────────────────────────────────────

class IdeaCreate(BaseModel):
    content: str


class IdeaOut(BaseModel):
    id: uuid.UUID
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
