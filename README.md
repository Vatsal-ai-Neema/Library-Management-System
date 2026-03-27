# Library Management System

Full-stack starter project built from the Excel workbook specification.

## Stack

- Backend: FastAPI
- Database: SQLite
- Frontend: React + Vite

## Workbook modules covered

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

## Notes

- The code uses SQLite by default for easy local setup.
- Passwords are masked in the frontend login form.
- Access is split by role according to the workbook rules.
- Maintenance data feeds transactions and reports, matching the workbook instructions.
