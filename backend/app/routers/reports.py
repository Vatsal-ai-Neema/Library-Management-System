from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CatalogItem, Issue, IssueRequest, Membership
from ..services import calculate_fine

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/books")
def books_report(db: Session = Depends(get_db)):
    return db.query(CatalogItem).filter(CatalogItem.item_type == "Book").all()


@router.get("/movies")
def movies_report(db: Session = Depends(get_db)):
    return db.query(CatalogItem).filter(CatalogItem.item_type == "Movie").all()


@router.get("/memberships")
def memberships_report(db: Session = Depends(get_db)):
    return db.query(Membership).all()


@router.get("/active-issues")
def report_active_issues(db: Session = Depends(get_db)):
    return db.query(Issue).filter(Issue.status == "Issued").all()


@router.get("/overdue-returns")
def overdue_returns(db: Session = Depends(get_db)):
    today = date.today()
    issues = db.query(Issue).filter(Issue.status == "Issued").all()
    result = []
    for issue in issues:
        if issue.due_date < today:
            result.append(
                {
                    "issue_id": issue.id,
                    "catalog_item_id": issue.catalog_item_id,
                    "membership_id": issue.membership_id,
                    "issue_date": issue.issue_date,
                    "due_date": issue.due_date,
                    "fine_calculation": calculate_fine(issue.due_date, today),
                }
            )
    return result


@router.get("/issue-requests")
def issue_requests(db: Session = Depends(get_db)):
    return db.query(IssueRequest).all()
