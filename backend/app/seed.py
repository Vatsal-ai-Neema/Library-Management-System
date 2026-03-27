from datetime import date, timedelta

from sqlalchemy.orm import Session

from .models import CatalogItem, Membership, User


def seed_data(db: Session) -> None:
    if not db.query(User).first():
        db.add_all(
            [
                User(
                    username="adm",
                    password="adm",
                    full_name="Admin User",
                    is_admin=True,
                    is_active=True,
                ),
                User(
                    username="user",
                    password="user",
                    full_name="Library User",
                    is_admin=False,
                    is_active=True,
                ),
            ]
        )

    if not db.query(Membership).first():
        today = date.today()
        db.add(
            Membership(
                membership_code="MEM001",
                first_name="Riya",
                last_name="Sharma",
                contact_number="9999999999",
                contact_address="Delhi",
                aadhar_number="123412341234",
                start_date=today,
                end_date=today + timedelta(days=365),
                status="Active",
                pending_fine_amount=0,
            )
        )

    if not db.query(CatalogItem).first():
        today = date.today()
        db.add_all(
            [
                CatalogItem(
                    item_type="Book",
                    title="Science Basics",
                    author_or_creator="A. Author",
                    category="Science",
                    procurement_date=today,
                    quantity=4,
                    status="Available",
                    cost=299,
                ),
                CatalogItem(
                    item_type="Movie",
                    title="Economics Story",
                    author_or_creator="B. Director",
                    category="Economics",
                    procurement_date=today,
                    quantity=2,
                    status="Available",
                    cost=499,
                ),
            ]
        )

    db.commit()
