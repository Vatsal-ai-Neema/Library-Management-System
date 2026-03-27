from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, SessionLocal, engine
from .routers import auth, catalog, dashboard, memberships, reports, transactions, users
from .seed import seed_data

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_data(db)

app = FastAPI(title="Library Management System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(memberships.router)
app.include_router(catalog.router)
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"message": "Library Management System API"}
