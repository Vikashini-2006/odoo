 Human Resource Management System

> **Every Workday, Perfectly Aligned.**

DAYFLOW is an intelligent, modern, SaaS-grade Human Resource Management System (HRMS) built for employees and HR administrators. Dayflow does not merely record HR data — it transforms workforce operational data into understandable insights, deterministic smart alerts, and recommended actions.

---

## Key Hackathon Highlights

- **Actionable HR Intelligence Platform**: Automated Action Center prioritization, Smart Alert Engine, Department Health Scoring (0–100), and Employee Operational Insights.
- **Full-Stack Architecture**: React 18 + Vite frontend with FastAPI backend, SQLAlchemy ORM, and SQLite database.
- **Enterprise SaaS Design**: Custom CSS design system, glassmorphism highlights, interactive Recharts visualizations, Lucide icons, responsive navigation, loading/empty states.
- **Strict Role-Based Security**: Role guards for `EMPLOYEE` vs `HR_ADMIN`, JWT bearer token authentication, bcrypt password hashing.

---

## User Roles & Capabilities

### Employee Portal
- **Secure Authentication**: JWT token authentication with bcrypt password hashing.
- **Personal Dashboard**: Live digital clock, workday check-in/out widget, attendance rate metric, leave balance summary, net monthly salary snapshot, and personal self-insights.
- **Profile Self-Service**: Inspect organizational details; edit personal phone number, residential address, and profile avatar.
- **Workday Attendance**: 1-click Check-In and Check-Out with working hours calculation and duplicate check-in prevention.
- **Leave Management**: Apply for Paid Leave, Sick Leave, or Unpaid Leave; date validation rules; track approval status and HR notes.
- **Payroll Statement**: Read-only breakdown of Basic Salary, Allowances, Deductions, and Net Direct Payout.

### HR / Admin Command Center
- **Dayflow Action Center**: Priority queue (`HIGH`, `MEDIUM`, `LOW`) of workforce situations requiring HR attention with recommended actions.
- **Workforce Analytics**: Metrics cards, Recharts department attendance comparison bar chart, status distribution donut chart, leave request breakdown, and department health score matrix.
- **Department Health Scoring**: Transparent formula: `Health Score = int(Attendance% * 0.6 + Availability% * 0.4)` (0–100) with factor inspection.
- **Smart Notification Center**: Header bell icon with real-time unread count badge, persistent read/unread state, and "Mark all read" capabilities.
- **Employee Directory**: Search by name/email/code, filter by department, add new employees (with transactional User, Employee, and Payroll creation), and edit profile records.
- **Attendance Master**: Master organization log of all employee check-in/out timestamps, hours worked, and status filters.
- **Leave Governance Portal**: Review pending leave requests, approve/reject applications, and record reviewer comments.
- **Payroll Manager**: View and update Basic Salary, Allowances, and Deductions with automatic backend net formula calculation (`net = basic + allowances - deductions`).

---

## Technology Stack

- **Frontend**: React 18, Vite, JavaScript, React Router DOM v6, Axios, Recharts, Lucide React Icons, Custom SaaS CSS.
- **Backend**: Python 3.10+ (Python 3.14 compatible), FastAPI, SQLAlchemy ORM, Pydantic v2, PyJWT, Bcrypt password hashing.
- **Database**: SQLite (`dayflow.db`) with automatic schema initialization and idempotent demo seeding.

---

## Project Structure

```
dayflow/
├── backend/
│   ├── main.py               # FastAPI entry point, CORS configuration, router registration
│   ├── database.py           # SQLAlchemy SQLite engine & session factory
│   ├── models.py             # ORM models (User, Employee, Attendance, LeaveRequest, Payroll, Notification)
│   ├── schemas.py            # Pydantic input/output schemas
│   ├── auth.py               # Direct bcrypt password hashing & JWT token utilities
│   ├── dependencies.py       # FastAPI DB session & role authentication guards
│   ├── seed.py               # Idempotent data seeder (HR Admin + 8 Employees + 30 days logs)
│   ├── requirements.txt      # Python package dependencies
│   ├── services/
│   │   └── insights.py       # Intelligence service layer (Action Center, Smart Alerts, Department Health)
│   └── routers/
│       ├── __init__.py
│       ├── auth.py           # Login & Current User endpoints
│       ├── employees.py      # Employee CRUD & profile management
│       ├── attendance.py     # Check-in, check-out, personal & master logs, stats
│       ├── leaves.py         # Leave application, review, approve, reject
│       ├── payroll.py        # Personal payroll & HR payroll manager
│       ├── dashboard.py      # Employee & HR executive dashboard statistics
│       ├── analytics.py      # Workforce analytics overview, attendance, leaves, department health
│       ├── insights.py       # Action Center items, Smart Alerts, employee insights
│       └── notifications.py  # Notification bell API & mark read handlers
│
├── frontend/
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite dev server & proxy settings
│   ├── index.html            # Web app root with Inter/Outfit typography
│   └── src/
│       ├── main.jsx          # React DOM root render
│       ├── App.jsx           # React Router setup & token context
│       ├── api.js            # Axios client with JWT bearer interceptor
│       ├── styles/
│       │   └── global.css    # Premium SaaS design system CSS
│       ├── components/
│       │   ├── Layout.jsx           # App frame with Sidebar & Header
│       │   ├── Sidebar.jsx          # Role-aware navigation drawer
│       │   ├── Header.jsx           # Top header with Notification Bell & check-in widget
│       │   ├── ProtectedRoute.jsx   # Role guard component
│       │   ├── StatCard.jsx         # Executive metric card
│       │   ├── Loading.jsx          # Spinner loader component
│       │   ├── EmptyState.jsx       # Custom empty state component
│       │   └── ToastNotification.jsx# Alert toast component
│       └── pages/
│           ├── Login.jsx            # SaaS login portal with 1-click demo login buttons
│           ├── EmployeeDashboard.jsx# Employee dashboard with self-insights
│           ├── HRDashboard.jsx      # HR Executive dashboard with Action Center widget
│           ├── ActionCenter.jsx     # Dayflow Action Center portal
│           ├── Analytics.jsx        # Workforce Analytics & Department Health dashboard
│           ├── Profile.jsx          # Profile management
│           ├── Attendance.jsx       # Personal & master attendance
│           ├── LeaveManagement.jsx  # Leave application form & tracker
│           ├── LeaveApprovals.jsx   # HR leave approval queue
│           ├── Employees.jsx        # Employee directory & add employee modal
│           ├── EmployeeDetails.jsx  # Employee inspection & Employee Insight Panel
│           ├── Payroll.jsx          # Compensation statement & HR payroll manager
│           └── NotFound.jsx         # Custom 404 page
├── .gitignore                # Git ignore rules
└── README.md                 # Project documentation
```

---

## Installation & Setup

### Prerequisites
- **Python 3.10+** (Python 3.14 compatible)
- **Node.js 18+** & `npm`

### 1. Backend Setup & Run

Navigate to the `backend/` directory:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
*Note: SQLite database `dayflow.db` auto-populates on first startup.*

### 2. Frontend Setup & Run

Navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to: `http://localhost:3000`

---

## Demo Login Credentials

You can log in directly using the 1-click demo buttons on the login page or using these credentials:

### HR / Administrator Account
- **Email**: `hr@dayflow.com`
- **Password**: `Admin@123`
- **Role**: `HR_ADMIN`

### Employee Accounts (Default Password: `User@123`)
1. **Alex Rivera** (Lead Engineer): `alex.dev@dayflow.com`
2. **Sarah Chen** (UI/UX Designer): `sarah.design@dayflow.com`
3. **Michael Ross** (HR Specialist): `michael.hr@dayflow.com`
4. **Emily Watson** (Financial Analyst): `emily.finance@dayflow.com`
5. **David Kim** (Content Lead): `david.marketing@dayflow.com`
6. **Jessica Taylor** (Operations Lead): `jessica.ops@dayflow.com`
7. **Robert Miller** (Backend Engineer): `robert.eng@dayflow.com`
8. **Lisa Anderson** (Growth Strategist): `lisa.mkt@dayflow.com`

---

## Main API Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/auth/me` | `GET` | Authenticated | Retrieve current user profile |
| `/api/analytics/overview` | `GET` | HR_ADMIN | Workforce analytics overview |
| `/api/analytics/attendance` | `GET` | HR_ADMIN | Attendance analytics & department comparison |
| `/api/analytics/leaves` | `GET` | HR_ADMIN | Leave request analytics breakdown |
| `/api/analytics/departments` | `GET` | HR_ADMIN | Department health scores & factors |
| `/api/insights/actions` | `GET` | HR_ADMIN | Dayflow Action Center prioritized items |
| `/api/insights/alerts` | `GET` | HR_ADMIN | Smart Alert engine output |
| `/api/insights/employee/{id}`| `GET` | Self / HR_ADMIN | Operational insights for specific employee |
| `/api/notifications` | `GET` | Authenticated | System & user smart notifications |
| `/api/notifications/read-all`| `PUT` | Authenticated | Mark all notifications as read |
| `/api/employees` | `GET` | HR_ADMIN | List all employees (search & department filter) |
| `/api/employees` | `POST` | HR_ADMIN | Create employee, user account & initial payroll |
| `/api/employees/{id}` | `PUT` | Self / HR_ADMIN | Update employee details |
| `/api/attendance/check-in` | `POST` | Employee | Record today's check-in timestamp |
| `/api/attendance/check-out` | `POST` | Employee | Record today's check-out timestamp |
| `/api/attendance/my` | `GET` | Employee | View personal attendance log |
| `/api/attendance/all` | `GET` | HR_ADMIN | View master organization attendance log |
| `/api/leaves` | `POST` | Employee | Submit new leave application |
| `/api/leaves/my` | `GET` | Employee | View personal leave applications |
| `/api/leaves` | `GET` | HR_ADMIN | View all employee leave applications |
| `/api/leaves/{id}/approve` | `PUT` | HR_ADMIN | Approve leave application with comment |
| `/api/leaves/{id}/reject` | `PUT` | HR_ADMIN | Reject leave application with comment |
| `/api/payroll/my` | `GET` | Employee | Read personal salary breakdown |
| `/api/payroll` | `GET` | HR_ADMIN | View all organization payroll records |
| `/api/payroll/{id}` | `PUT` | HR_ADMIN | Update employee salary components |
