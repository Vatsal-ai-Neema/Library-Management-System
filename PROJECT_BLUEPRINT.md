# Library Management System Blueprint

## Source interpretation

This blueprint treats the Excel workbook as one combined specification document.

Primary project area identified from the workbook:
- Library Management System
- Business / CRM + Sales System
- Roles: Admin and User
- Major modules: Login, Home, Maintenance, Transactions, Reports

Key rules extracted from the workbook:
- Admin can access maintenance, reports, and transactions.
- User can access reports and transactions, but not maintenance.
- Passwords must be masked on login pages.
- Form validations are required.
- Maintenance is mandatory because reports and transactions depend on master data.
- Book availability must require at least one search filter before submit.
- Radio button groups must allow only one selection.

## Functional modules

### 1. Authentication
- Admin login
- User login
- Logout
- Role-based access control

### 2. Dashboard
- Admin home page
- User home page
- Product/category summary display

### 3. Maintenance
- Membership
  - Add membership
  - Update membership
- Books and movies
  - Add book/movie
  - Update book/movie
- User management
  - Add user
  - Update user
  - Admin flag
  - Active/inactive state

### 4. Transactions
- Check book availability
- Search results with selectable issue option
- Issue book/movie
- Return book/movie
- Pay fine
- Cancel flow
- Confirmation flow

### 5. Reports
- Master list of books
- Master list of movies
- Master list of memberships
- Active issues
- Overdue returns
- Issue requests

## Core entities

- User
- Role
- Membership
- Member
- CatalogItem
- CatalogCopy
- IssueTransaction
- ReturnTransaction
- Fine
- IssueRequest
- AuditLog

## Suggested data model

### users
- id
- username
- password_hash
- full_name
- is_admin
- is_active
- created_at
- updated_at

### memberships
- id
- membership_code
- first_name
- last_name
- contact_number
- contact_address
- aadhar_number
- start_date
- end_date
- status
- pending_fine_amount
- created_at
- updated_at

### catalog_items
- id
- item_type
- title
- author_or_creator
- category
- procurement_date
- total_quantity
- created_at
- updated_at

### catalog_copies
- id
- catalog_item_id
- serial_number
- status
- cost
- acquired_on

### issue_requests
- id
- membership_id
- catalog_item_id
- requested_at
- fulfilled_at
- status

### issues
- id
- membership_id
- catalog_copy_id
- issued_by_user_id
- issue_date
- due_date
- actual_return_date
- remarks
- status

### fines
- id
- issue_id
- amount
- paid_amount
- pending_amount
- calculated_on
- paid_on

## API areas

- `POST /auth/login`
- `POST /auth/logout`
- `GET /dashboard`
- `GET /catalog/search`
- `POST /transactions/issues`
- `POST /transactions/returns`
- `POST /transactions/fines/pay`
- `GET /reports/books`
- `GET /reports/movies`
- `GET /reports/memberships`
- `GET /reports/active-issues`
- `GET /reports/overdue-returns`
- `GET /reports/issue-requests`
- `POST /memberships`
- `PUT /memberships/{id}`
- `POST /catalog/items`
- `PUT /catalog/items/{id}`
- `POST /users`
- `PUT /users/{id}`

## Full-stack implementation path

Tech stack for this workbook:
- Backend: Django + Django REST Framework
- Frontend: React + Vite
- Database: PostgreSQL
- Auth: Session auth or JWT
- UI: React Router + form validation + role guards

Reason:
- The workbook describes many CRUD screens, validations, reports, and role-based actions.

## Project breakdown

### Phase 1. Requirement normalization
- Read the Excel workbook as one combined specification
- Separate the project into 2 systems:
-- Library Management System
-- Business / CRM + Sales System
- Extract mandatory validations, roles, and page behaviors
- Map workbook sheets to modules, entities, and flows

### Phase 2. Backend foundation
- Create Python backend using FastAPI
- Configure PostgreSQL database connection
- Set up SQLAlchemy models
- Add API routers for library and business modules
- Build login API and system-based role split

### Phase 3. Database and business logic
Implement models for:
- users
- memberships
- catalog items
- issues
- fines
- customers
- ledger
- products
- schemes
- indents
- travel
- expenses
- farmer demo
- Seed initial demo data
- Add issue, return, overdue, and fine calculation logic
- Add report data endpoints

### Phase 4. Frontend
- Build frontend using React + Vite
- Create login screen for both systems
- Build library admin/user dashboards
- Build maintenance forms
- Build transactions UI
- Build reports tables
- Build business / CRM pages:
- customers
- customer detail
- ledger
- aging
- products
- indent book
- schemes
- status
- travel
- expenses
- farmers

### Phase 5. Validation and security
- Required-field validations on forms
- Password masking on login forms
- Role-based UI separation for admin and user
- Search validation for book availability
- Radio button single-selection logic
- Fine validation and pending-fine handling
- Checkbox-based yes/no behavior where required

### Phase 6. Testing and verification
- Manual validation against workbook screens and instructions
- Local backend API verification
- Local frontend run verification
- Form flow validation for:
  - login
  - membership
  - catalog
  - issue
  - return
  - pay fine
  - CRM forms

### Phase 7. Submission preparation
- PostgreSQL local setup
- Git repository initialization
- GitHub repository creation
- Push code to main branch
- No deployment, as per requirement
- Submission-ready GitHub link preparation

## Task coverage map

Workbook tasks covered by the implementation plan:
- Login and logout
- Admin/user role split
- Maintenance dependency before reports/transactions
- Book/movie master management
- Membership management
- User management
- Availability search
- Issue flow
- Return flow
- Fine calculation and payment
- Report generation
- Cancel and confirmation states

## Build order

1. Authentication and roles
2. Membership master
3. Catalog master for books/movies
4. User management
5. Availability search
6. Issue flow
7. Return flow
8. Fine calculation
9. Reports
10. Final polish, testing, deployment

## Important assumptions

- The library-related sheets are the main implementation scope in the workbook.
- Books and movies can share a unified catalog model using `item_type`.
- Fine is calculated from overdue days and configurable rate.
- Reports are filterable data tables, with export as a later enhancement.
