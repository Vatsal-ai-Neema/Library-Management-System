from datetime import date, timedelta

from sqlalchemy.orm import Session

from .models import (
    BusinessProduct,
    CatalogItem,
    Customer,
    ExpenseEntry,
    FarmerDemo,
    Indent,
    LedgerEntry,
    Membership,
    OrderStatus,
    Scheme,
    TravelEntry,
    User,
)


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
                    system_type="library",
                ),
                User(
                    username="HYD-118",
                    password="HYD-118",
                    full_name="Karnati Chandrahasa Reddy",
                    is_admin=False,
                    is_active=True,
                    system_type="business",
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

    if not db.query(Customer).first():
        db.add_all(
            [
                Customer(
                    code="DR-AP-0001",
                    name="Andhra Fertilizers & Pesticides",
                    address="Guntur",
                    phone_no="9540555021",
                    credit_limit=400000,
                    advance_credit_limit=0,
                    balance=150000,
                    outstanding=150000,
                    available_normal_credit_limit=399499,
                    available_advance_credit_limit=0,
                    last_payment=4685,
                    target_assigned=True,
                    active=True,
                ),
                Customer(
                    code="DR-AP-0002",
                    name="Bhargavi Seeds & Pesticides",
                    address="Guntur",
                    phone_no="9000000002",
                    credit_limit=250000,
                    advance_credit_limit=0,
                    balance=70000,
                    outstanding=70000,
                    available_normal_credit_limit=180000,
                    available_advance_credit_limit=0,
                    last_payment=5000,
                    target_assigned=True,
                    active=True,
                ),
            ]
        )

    if not db.query(LedgerEntry).first():
        db.add_all(
            [
                LedgerEntry(
                    customer_code="DR-AP-0001",
                    voucher="PSI-GUN-T-1011-0314",
                    invoice_date="40350",
                    amount=314.5,
                    balance=0,
                ),
                LedgerEntry(
                    customer_code="DR-AP-0001",
                    voucher="BR-IC1331-1314012664",
                    invoice_date="41505",
                    amount=-150000,
                    balance=0,
                ),
            ]
        )

    if not db.query(BusinessProduct).first():
        db.add_all(
            [
                BusinessProduct(
                    code="FGMFN0018",
                    name="AGROZIM 100X50 GM",
                    category="Fertilizer",
                    price=12,
                    highlighted_scheme="QD1516-004",
                ),
                BusinessProduct(
                    code="FGMFN0019",
                    name="AGROZIM 50X100 GM",
                    category="Fertilizer",
                    price=30,
                    highlighted_scheme="QD1516-004",
                ),
            ]
        )

    if not db.query(Scheme).first():
        db.add_all(
            [
                Scheme(code="QD1516-004", description="qty must be 10000 within 60 days."),
                Scheme(code="LD1516-006", description="lifting gain within 7 days"),
            ]
        )

    if not db.query(Indent).first():
        db.add(
            Indent(
                customer_code="DR-AP-0001",
                product_code="FGMFN0018",
                quantity=100,
                scheme_code="QD1516-004",
                status="Indent Booked",
            )
        )

    if not db.query(TravelEntry).first():
        db.add(
            TravelEntry(
                travel_date="44904",
                travel_time="10.00 am",
                from_location="home",
                to_location="customer add",
                customer_name="Andhra Fertilizers & Pesticides",
                distance=30,
            )
        )

    if not db.query(ExpenseEntry).first():
        db.add(
            ExpenseEntry(
                entry_date="42278",
                customer_code="DR-AP-0001",
                customer_name="Andhra Fertilizers & Pesticides",
                journey_km=150,
                ta_amount=150,
                conveyance_amount=0,
                da_amount=0,
                telephone_amount=0,
                repair_amount=15000,
                other_amount=0,
                senior_approval="yes",
            )
        )

    if not db.query(FarmerDemo).first():
        db.add(
            FarmerDemo(
                farmer_name="Ramu",
                father_name="Suresh",
                mobile_no="9999999991",
                aadhar_card_no="222233334444",
                village_name="Village A",
                district_name="Guntur",
                season="Kharif",
                demo_crop_name="Cotton",
                purpose="Yield Improvement",
            )
        )

    if not db.query(OrderStatus).first():
        db.add_all(
            [
                OrderStatus(order_name="order 1", indent_no="si-ap-1415-001", bill_no="", dispatch_no=""),
                OrderStatus(order_name="order 2", indent_no="si-ap-1415-003", bill_no="", dispatch_no=""),
            ]
        )

    db.commit()
