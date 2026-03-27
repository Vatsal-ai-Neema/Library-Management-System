from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Membership
from ..schemas import MembershipCreate, MembershipUpdate

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("")
def list_memberships(db: Session = Depends(get_db)):
    return db.query(Membership).all()


@router.post("")
def create_membership(payload: MembershipCreate, db: Session = Depends(get_db)):
    membership = Membership(**payload.model_dump(), status="Active", pending_fine_amount=0)
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


@router.put("/{membership_id}")
def update_membership(membership_id: int, payload: MembershipUpdate, db: Session = Depends(get_db)):
    membership = db.query(Membership).filter(Membership.id == membership_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(membership, key, value)
    db.commit()
    db.refresh(membership)
    return membership
