# Library Management System

This a full-stack library operations platform built with FastAPI, PostgreSQL, and React. The project includes role-based access for administrators and users, catalog and membership maintenance, circulation workflows, fine handling, and reporting tools in a single repository.

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

## Render Deployment

This project is prepared for a Render-only deployment setup:

- Backend: Render Web Service
- Frontend: Render Static Site
- Database: Render PostgreSQL

### Environment variables

Backend:
- `DATABASE_URL`
- `CORS_ORIGINS`

Frontend:
- `VITE_API_BASE_URL`

### Render steps

1. Push the latest code to GitHub.
2. In Render, create a new Blueprint deploy from the repo using [render.yaml](/C:/Users/vatsa/Downloads/Library%20Management%20System/render.yaml).
3. Render will create:
   - PostgreSQL database
   - backend web service
   - frontend static site
4. After the first deploy, update these values in `render.yaml` or in the Render dashboard:
   - backend `CORS_ORIGINS` to your actual frontend Render URL
   - frontend `VITE_API_BASE_URL` to your actual backend Render URL
5. Redeploy both services.

### Notes

- The frontend should never keep `http://127.0.0.1:8000` in production.
- The backend start command on Render is:
  - `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

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

## Release

The first public snapshot of this repository is tracked in [CHANGELOG.md](./CHANGELOG.md) as `v1.0.0`.
