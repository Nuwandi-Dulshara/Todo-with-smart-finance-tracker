import re
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Full name must contain at least 2 characters.")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password must contain an uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise ValueError("Password must contain a lowercase letter.")
        if not re.search(r"[0-9]", value):
            raise ValueError("Password must contain a number.")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Password must contain a special character.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    remember_me: bool = False


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr