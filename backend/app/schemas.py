from datetime import date

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    username: str
    full_name: str
    role: str


class MembershipCreate(BaseModel):
    membership_code: str
    first_name: str
    last_name: str
    contact_number: str
    contact_address: str
    aadhar_number: str
    start_date: date
    end_date: date


class MembershipUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None


class CatalogItemCreate(BaseModel):
    item_type: str = Field(pattern="^(Book|Movie)$")
    title: str
    author_or_creator: str
    category: str
    procurement_date: date
    quantity: int = Field(default=1, ge=1)
    cost: float = Field(default=0, ge=0)


class CatalogItemUpdate(BaseModel):
    status: str | None = None
    procurement_date: date | None = None
    quantity: int | None = Field(default=None, ge=1)


class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    is_admin: bool = False
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_admin: bool | None = None
    is_active: bool | None = None


class IssueCreate(BaseModel):
    membership_id: int
    catalog_item_id: int
    issue_date: date
    due_date: date
    remarks: str = ""


class ReturnCreate(BaseModel):
    issue_id: int
    actual_return_date: date
    remarks: str = ""


class FinePayment(BaseModel):
    issue_id: int
    amount: float = Field(ge=0)
