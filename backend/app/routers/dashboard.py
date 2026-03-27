from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CatalogItem, Membership, User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_memberships": db.query(Membership).count(),
        "total_catalog_items": db.query(CatalogItem).count(),
        "categories": sorted({item.category for item in db.query(CatalogItem).all()}),
    }
