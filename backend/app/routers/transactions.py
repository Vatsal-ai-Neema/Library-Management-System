from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CatalogItem, Issue, Membership
from ..schemas import FinePayment, IssueCreate, ReturnCreate
from ..services import calculate_fine

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/active-issues")
def active_issues(db: Session = Depends(get_db)):
    return db.query(Issue).filter(Issue.status.in_(["Issued", "Pending Fine"])).all()


@router.post("/issue")
def issue_item(payload: IssueCreate, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == payload.membership_id).first()
    item = db.query(CatalogItem).filter(CatalogItem.id == payload.catalog_item_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    if membership.status != "Active":
        raise HTTPException(status_code=400, detail="Membership is not active")
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Item not available")
    if payload.issue_date < date.today():
        raise HTTPException(status_code=400, detail="Issue date cannot be less than today")
    if payload.due_date < payload.issue_date:
        raise HTTPException(status_code=400, detail="Return date cannot be before issue date")
    if (payload.due_date - payload.issue_date).days > 15:
        raise HTTPException(status_code=400, detail="Return date cannot be greater than 15 days from issue date")

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
    if payload.actual_return_date < issue.issue_date:
        raise HTTPException(status_code=400, detail="Return date cannot be before issue date")

    item = db.query(CatalogItem).filter(CatalogItem.id == issue.catalog_item_id).first()
    fine_amount = calculate_fine(issue.due_date, payload.actual_return_date)
    issue.actual_return_date = payload.actual_return_date
    issue.remarks = payload.remarks
    issue.fine_amount = fine_amount

    if fine_amount > 0:
        issue.status = "Pending Fine"
    else:
        issue.status = "Returned"
        if item:
            item.quantity += 1
            item.status = "Available"

    membership = db.query(Membership).filter(Membership.id == issue.membership_id).first()
    if membership and fine_amount > 0:
        membership.pending_fine_amount += fine_amount

    db.commit()
    db.refresh(issue)
    return {
        "message": "Proceed to Pay Fine" if fine_amount > 0 else "Transaction completed successfully",
        "issue": issue,
        "fine_amount": fine_amount,
    }


@router.get("/issue/{issue_id}")
def issue_detail(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


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
    if payload.amount < 0:
        raise HTTPException(status_code=400, detail="Fine paid cannot be negative")
    if issue.status == "Pending Fine" and payload.amount < issue.fine_amount:
        raise HTTPException(status_code=400, detail="Pending fine must be paid before completing return")

    membership.pending_fine_amount -= payload.amount
    if membership.pending_fine_amount < 0:
        membership.pending_fine_amount = 0

    if issue.status == "Pending Fine" and payload.amount >= issue.fine_amount:
        item = db.query(CatalogItem).filter(CatalogItem.id == issue.catalog_item_id).first()
        if item:
            item.quantity += 1
            item.status = "Available"
        issue.status = "Returned"

    db.commit()
    return {
        "message": "Fine payment recorded",
        "remaining_pending_amount": membership.pending_fine_amount,
    }
