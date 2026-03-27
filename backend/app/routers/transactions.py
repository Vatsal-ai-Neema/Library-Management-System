from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CatalogItem, Issue, Membership
from ..schemas import FinePayment, IssueCreate, ReturnCreate
from ..services import calculate_fine

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/active-issues")
def active_issues(db: Session = Depends(get_db)):
    return db.query(Issue).filter(Issue.status == "Issued").all()


@router.post("/issue")
def issue_item(payload: IssueCreate, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == payload.membership_id).first()
    item = db.query(CatalogItem).filter(CatalogItem.id == payload.catalog_item_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item not available")

    issue = Issue(**payload.model_dump(), status="Issued", fine_amount=0)
    item.quantity -= 1
    item.status = "Available" if item.quantity > 0 else "Unavailable"
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@router.post("/return")
def return_item(payload: ReturnCreate, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == payload.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.status == "Returned":
        raise HTTPException(status_code=400, detail="Item already returned")

    item = db.query(CatalogItem).filter(CatalogItem.id == issue.catalog_item_id).first()
    fine_amount = calculate_fine(issue.due_date, payload.actual_return_date)
    issue.actual_return_date = payload.actual_return_date
    issue.remarks = payload.remarks
    issue.status = "Returned"
    issue.fine_amount = fine_amount

    if item:
        item.quantity += 1
        item.status = "Available"

    membership = db.query(Membership).filter(Membership.id == issue.membership_id).first()
    if membership:
        membership.pending_fine_amount += fine_amount

    db.commit()
    db.refresh(issue)
    return {"message": "Transaction completed successfully", "issue": issue}


@router.post("/pay-fine")
def pay_fine(payload: FinePayment, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == payload.issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    membership = db.query(Membership).filter(Membership.id == issue.membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    if payload.amount > membership.pending_fine_amount:
        raise HTTPException(status_code=400, detail="Amount exceeds pending fine")

    membership.pending_fine_amount -= payload.amount
    db.commit()
    return {
        "message": "Fine payment recorded",
        "remaining_pending_amount": membership.pending_fine_amount,
    }
