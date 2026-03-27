from datetime import date

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    username: str
    full_name: str
    role: str
    system_type: str


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


class CustomerCreate(BaseModel):
    code: str
    name: str
    address: str
    phone_no: str
    credit_limit: float = 0
    advance_credit_limit: float = 0
    balance: float = 0
    outstanding: float = 0
    available_normal_credit_limit: float = 0
    available_advance_credit_limit: float = 0
    last_payment: float = 0


class BusinessProductCreate(BaseModel):
    code: str
    name: str
    category: str
    price: float
    highlighted_scheme: str = ""


class IndentCreate(BaseModel):
    customer_code: str
    product_code: str
    quantity: int = Field(ge=1)
    scheme_code: str = ""


class TravelEntryCreate(BaseModel):
    travel_date: str
    travel_time: str
    from_location: str
    to_location: str
    customer_name: str
    distance: float = Field(ge=0)


class ExpenseEntryCreate(BaseModel):
    entry_date: str
    customer_code: str
    customer_name: str
    journey_km: float = Field(ge=0)
    ta_amount: float = 0
    conveyance_amount: float = 0
    da_amount: float = 0
    telephone_amount: float = 0
    repair_amount: float = 0
    other_amount: float = 0
    senior_approval: str = "no"


class FarmerDemoCreate(BaseModel):
    farmer_name: str
    father_name: str
    mobile_no: str
    aadhar_card_no: str
    village_name: str
    district_name: str
    season: str
    demo_crop_name: str
    purpose: str
