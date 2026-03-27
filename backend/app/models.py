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
