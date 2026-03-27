from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    BusinessProduct,
    Customer,
    ExpenseEntry,
    FarmerDemo,
    Indent,
    LedgerEntry,
    OrderStatus,
    Scheme,
    TravelEntry,
)
from ..schemas import (
    BusinessProductCreate,
    CustomerCreate,
    ExpenseEntryCreate,
    FarmerDemoCreate,
    IndentCreate,
    TravelEntryCreate,
)

router = APIRouter(prefix="/business", tags=["business"])


@router.get("/customers")
def list_customers(
    search: str | None = Query(default=None),
    target_only: bool = Query(default=False),
    active_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(Customer)
    if search:
        query = query.filter((Customer.code.ilike(f"%{search}%")) | (Customer.name.ilike(f"%{search}%")))
    if target_only:
        query = query.filter(Customer.target_assigned.is_(True))
    if active_only:
        query = query.filter(Customer.active.is_(True))
    return query.all()


@router.post("/customers")
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(**payload.model_dump(), target_assigned=True, active=True)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/customers/{customer_code}")
def customer_detail(customer_code: str, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.code == customer_code).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.get("/ledger")
def ledger(customer_code: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(LedgerEntry)
    if customer_code:
        query = query.filter(LedgerEntry.customer_code == customer_code)
    return query.all()


@router.get("/aging")
def aging(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    result = []
    for customer in customers:
        outstanding = customer.outstanding
        result.append(
            {
                "code": customer.code,
                "name": customer.name,
                "0_30": outstanding * 0.5,
                "31_60": outstanding * 0.25,
                "61_90": outstanding * 0.15,
                "91_120": outstanding * 0.1,
                "121_180": 0,
            }
        )
    return result


@router.get("/products")
def list_products(search: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(BusinessProduct)
    if search:
        query = query.filter(
            (BusinessProduct.code.ilike(f"%{search}%")) | (BusinessProduct.name.ilike(f"%{search}%"))
        )
    return query.all()


@router.post("/products")
def create_product(payload: BusinessProductCreate, db: Session = Depends(get_db)):
    product = BusinessProduct(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/schemes")
def list_schemes(db: Session = Depends(get_db)):
    return db.query(Scheme).all()


@router.get("/indents")
def list_indents(db: Session = Depends(get_db)):
    return db.query(Indent).all()


@router.post("/indents")
def create_indent(payload: IndentCreate, db: Session = Depends(get_db)):
    indent = Indent(**payload.model_dump(), status="Indent Booked")
    db.add(indent)
    db.commit()
    db.refresh(indent)
    return indent


@router.get("/status")
def list_status(db: Session = Depends(get_db)):
    return db.query(OrderStatus).all()


@router.get("/travel")
def list_travel(db: Session = Depends(get_db)):
    return db.query(TravelEntry).all()


@router.post("/travel")
def create_travel(payload: TravelEntryCreate, db: Session = Depends(get_db)):
    entry = TravelEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/expenses")
def list_expenses(db: Session = Depends(get_db)):
    return db.query(ExpenseEntry).all()


@router.post("/expenses")
def create_expense(payload: ExpenseEntryCreate, db: Session = Depends(get_db)):
    entry = ExpenseEntry(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/farmers")
def list_farmers(db: Session = Depends(get_db)):
    return db.query(FarmerDemo).all()


@router.post("/farmers")
def create_farmer(payload: FarmerDemoCreate, db: Session = Depends(get_db)):
    entry = FarmerDemo(**payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
