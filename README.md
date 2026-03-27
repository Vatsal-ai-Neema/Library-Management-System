# Workbook Full-Stack Submission

Full-stack starter project built from the Excel workbook specification as one submission repository.

## Stack

- Backend: FastAPI
- Database: SQLite
- Frontend: React + Vite

## Systems covered

### 1. Library Management System
- Admin login
- User login
- Admin and user dashboards
- Maintenance
  - Memberships
  - Books and movies
  - User management
- Transactions
  - Availability search
  - Issue item
  - Return item
  - Pay fine
- Reports
  - Books
  - Movies
  - Memberships
- Active issues
- Overdue returns
- Issue requests

### 2. Business / CRM + Sales System
- Sales person login
- Customer list
- Customer detail
- Ledger info
- Aging
- Product list
- Scheme list
- Indent booking
- Order status
- Travel report
- T.A / D.A
- Farmer demo
- Dealer-style customer and indent flows

## Structure

```text
backend/
  app/
    routers/
frontend/
  src/
```

## Run backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Default login users

- Admin: `adm` / `adm`
- User: `user` / `user`
- Sales / CRM: `HYD-118` / `HYD-118`

## Notes

- The code uses SQLite by default for easy local setup.
- Passwords are masked in the frontend login form.
- Access is split by workbook system and role.
- Maintenance data feeds library transactions and reports, matching the workbook instructions.
- This repo is intentionally not deployed.
