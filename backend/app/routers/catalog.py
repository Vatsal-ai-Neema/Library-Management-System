from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CatalogItem
from ..schemas import CatalogItemCreate, CatalogItemUpdate

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("")
def list_catalog(db: Session = Depends(get_db)):
    return db.query(CatalogItem).all()


@router.get("/search")
def search_catalog(
    title: str | None = Query(default=None),
    author_or_creator: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if not title and not author_or_creator:
        raise HTTPException(status_code=400, detail="Enter title or author to search")

    query = db.query(CatalogItem)
    filters = []
    if title:
        filters.append(CatalogItem.title.ilike(f"%{title}%"))
    if author_or_creator:
        filters.append(CatalogItem.author_or_creator.ilike(f"%{author_or_creator}%"))
    return query.filter(or_(*filters)).all()


@router.post("")
def create_catalog_item(payload: CatalogItemCreate, db: Session = Depends(get_db)):
    item = CatalogItem(**payload.model_dump(), status="Available")
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}")
def update_catalog_item(item_id: int, payload: CatalogItemUpdate, db: Session = Depends(get_db)):
    item = db.query(CatalogItem).filter(CatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Catalog item not found")
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item
