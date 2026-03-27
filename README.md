# Library Management System

A full-stack library operations platform built with FastAPI, PostgreSQL, and React. The project includes role-based access for administrators and users, catalog and membership maintenance, circulation workflows, fine handling, and reporting tools in a single repository.

## Highlights

- Role-based login for admin and user experiences
- Library maintenance modules for memberships, users, books, and movies
- Transaction flows for search, issue, return, and fine payment
- Reports for inventory, memberships, active issues, overdue returns, and requests
- PostgreSQL-backed backend API with a React frontend

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Pydantic
- Database: PostgreSQL
- Frontend: React, Vite, CSS

## Repository Structure

```text
backend/
  app/
    routers/
    main.py
    models.py
    schemas.py
    services.py
frontend/
  src/
    App.jsx
    styles.css
PROJECT_BLUEPRINT.md
```

## Core Modules

### Authentication and Access

- Admin login
- User login
- Role-aware navigation and dashboards

### Maintenance

- Membership management
- Book and movie catalog management
- User administration

### Transactions

- Availability search
- Issue item workflow
- Return item workflow
- Fine payment handling

### Reports

- Books report
- Movies report
- Membership report
- Active issues report
- Overdue returns report
- Issue requests report

## Local Setup

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
$env:DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/workbook_submission"
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173`.

## Default Demo Credentials

- Admin: `adm` / `adm`
- User: `user` / `user`
- Sales or CRM: `HYD-118` / `HYD-118`

## Database Notes

- The default fallback database URL is `postgresql+psycopg2://postgres:postgres@localhost:5432/workbook_submission`.
- PostgreSQL must be running locally before the backend starts.

## Roadmap

- Add automated backend and frontend test coverage
- Add Docker-based local setup
- Deploy a hosted demo environment
- Export reports to CSV or PDF

## Release

The first public snapshot of this repository is tracked in [CHANGELOG.md](./CHANGELOG.md) as `v1.0.0`.
