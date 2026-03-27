from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    system_type: Mapped[str] = mapped_column(String(30), default="library")


class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    membership_code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_address: Mapped[str] = mapped_column(String(255), nullable=False)
    aadhar_number: Mapped[str] = mapped_column(String(30), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Active")
    pending_fine_amount: Mapped[float] = mapped_column(Float, default=0)


class CatalogItem(Base):
    __tablename__ = "catalog_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    item_type: Mapped[str] = mapped_column(String(10), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    author_or_creator: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    procurement_date: Mapped[date] = mapped_column(Date, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(20), default="Available")
    cost: Mapped[float] = mapped_column(Float, default=0)

    issues: Mapped[list["Issue"]] = relationship(back_populates="item")


class IssueRequest(Base):
    __tablename__ = "issue_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    membership_id: Mapped[int] = mapped_column(ForeignKey("memberships.id"))
    catalog_item_id: Mapped[int] = mapped_column(ForeignKey("catalog_items.id"))
    requested_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    fulfilled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending")


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    membership_id: Mapped[int] = mapped_column(ForeignKey("memberships.id"))
    catalog_item_id: Mapped[int] = mapped_column(ForeignKey("catalog_items.id"))
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    actual_return_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    remarks: Mapped[str] = mapped_column(String(255), default="")
    status: Mapped[str] = mapped_column(String(20), default="Issued")
    fine_amount: Mapped[float] = mapped_column(Float, default=0)

    item: Mapped["CatalogItem"] = relationship(back_populates="issues")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    phone_no: Mapped[str] = mapped_column(String(20), nullable=False)
    credit_limit: Mapped[float] = mapped_column(Float, default=0)
    advance_credit_limit: Mapped[float] = mapped_column(Float, default=0)
    balance: Mapped[float] = mapped_column(Float, default=0)
    outstanding: Mapped[float] = mapped_column(Float, default=0)
    available_normal_credit_limit: Mapped[float] = mapped_column(Float, default=0)
    available_advance_credit_limit: Mapped[float] = mapped_column(Float, default=0)
    last_payment: Mapped[float] = mapped_column(Float, default=0)
    target_assigned: Mapped[bool] = mapped_column(Boolean, default=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_code: Mapped[str] = mapped_column(String(30), nullable=False)
    voucher: Mapped[str] = mapped_column(String(50), nullable=False)
    invoice_date: Mapped[str] = mapped_column(String(30), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0)
    balance: Mapped[float] = mapped_column(Float, default=0)


class BusinessProduct(Base):
    __tablename__ = "business_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    price: Mapped[float] = mapped_column(Float, default=0)
    highlighted_scheme: Mapped[str] = mapped_column(String(50), default="")


class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)


class Indent(Base):
    __tablename__ = "indents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    customer_code: Mapped[str] = mapped_column(String(30), nullable=False)
    product_code: Mapped[str] = mapped_column(String(30), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    scheme_code: Mapped[str] = mapped_column(String(30), default="")
    status: Mapped[str] = mapped_column(String(30), default="Indent Booked")


class TravelEntry(Base):
    __tablename__ = "travel_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    travel_date: Mapped[str] = mapped_column(String(30), nullable=False)
    travel_time: Mapped[str] = mapped_column(String(30), nullable=False)
    from_location: Mapped[str] = mapped_column(String(100), nullable=False)
    to_location: Mapped[str] = mapped_column(String(100), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    distance: Mapped[float] = mapped_column(Float, default=0)


class ExpenseEntry(Base):
    __tablename__ = "expense_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    entry_date: Mapped[str] = mapped_column(String(30), nullable=False)
    customer_code: Mapped[str] = mapped_column(String(30), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    journey_km: Mapped[float] = mapped_column(Float, default=0)
    ta_amount: Mapped[float] = mapped_column(Float, default=0)
    conveyance_amount: Mapped[float] = mapped_column(Float, default=0)
    da_amount: Mapped[float] = mapped_column(Float, default=0)
    telephone_amount: Mapped[float] = mapped_column(Float, default=0)
    repair_amount: Mapped[float] = mapped_column(Float, default=0)
    other_amount: Mapped[float] = mapped_column(Float, default=0)
    senior_approval: Mapped[str] = mapped_column(String(10), default="no")


class FarmerDemo(Base):
    __tablename__ = "farmer_demos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    farmer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    father_name: Mapped[str] = mapped_column(String(150), nullable=False)
    mobile_no: Mapped[str] = mapped_column(String(20), nullable=False)
    aadhar_card_no: Mapped[str] = mapped_column(String(30), nullable=False)
    village_name: Mapped[str] = mapped_column(String(100), nullable=False)
    district_name: Mapped[str] = mapped_column(String(100), nullable=False)
    season: Mapped[str] = mapped_column(String(50), nullable=False)
    demo_crop_name: Mapped[str] = mapped_column(String(100), nullable=False)
    purpose: Mapped[str] = mapped_column(String(100), nullable=False)


class OrderStatus(Base):
    __tablename__ = "order_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_name: Mapped[str] = mapped_column(String(50), nullable=False)
    indent_no: Mapped[str] = mapped_column(String(50), nullable=False)
    bill_no: Mapped[str] = mapped_column(String(50), default="")
    dispatch_no: Mapped[str] = mapped_column(String(50), default="")
