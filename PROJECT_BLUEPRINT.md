# Library Management System Blueprint

## Source interpretation

This blueprint treats the Excel workbook as one combined specification document.

Primary project area identified from the workbook:
- Library Management System
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

## Full-stack implementation options

### Option A: Django + Django REST Framework + React
Best when:
- You want a strong Python backend with built-in admin, ORM, auth, and rapid CRUD development.

Pros:
- Fast for role-based business apps
- Excellent ORM and migrations
- Easy admin panel for internal maintenance
- Mature authentication ecosystem

### Option B: FastAPI + PostgreSQL + React
Best when:
- You want a modern API-first architecture and a clean separation between frontend and backend.

Pros:
- Very fast backend development
- Strong typing and docs
- Great for clean REST APIs
- Easy to scale later

### Option C: Django full-stack with server-rendered templates
Best when:
- You want the fastest delivery with fewer moving parts.

Pros:
- One codebase
- Simple deployment
- Good for academic/demo projects
- Lowest frontend complexity

## Recommended path

Recommended stack for this workbook:
- Backend: Django + Django REST Framework
- Frontend: React + Vite
- Database: PostgreSQL
- Auth: Session auth or JWT
- UI: React Router + form validation + role guards

Reason:
- The workbook describes many CRUD screens, validations, reports, and role-based actions. Django handles this kind of system very efficiently.

## Project breakdown

### Phase 1. Requirement normalization
- Convert workbook sheets into one requirements matrix
- Identify mandatory validations and business rules
- Finalize entities and field definitions
- Remove ambiguity like book vs movie shared flows

### Phase 2. Backend foundation
- Create Django project and apps
- Configure PostgreSQL
- Build custom user model
- Add role and permission middleware
- Add API structure

### Phase 3. Database and business logic
- Implement models
- Add migrations
- Add issue/return/fine calculation logic
- Add overdue logic
- Add report queries

### Phase 4. Frontend
- Build auth pages
- Build admin and user dashboards
- Build maintenance forms
- Build transaction flows
- Build report tables and filters

### Phase 5. Validation and security
- Required-field validations
- Role checks on UI and API
- Masked passwords
- Input sanitation
- Error handling

### Phase 6. Testing
- Unit tests for business logic
- API tests for role access
- Frontend form tests
- End-to-end flow tests

### Phase 7. Deployment
- Docker setup
- Environment variables
- Production database
- Static/media handling
- Deployment guide

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
