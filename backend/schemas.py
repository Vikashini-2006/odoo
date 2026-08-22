from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Auth Schemas
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    created_at: datetime
    employee_id: Optional[int] = None
    full_name: Optional[str] = None
    employee_code: Optional[str] = None
    profile_image: Optional[str] = None

    class Config:
        from_attributes = True

# Employee Schemas
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    department: str
    designation: str
    joining_date: date
    profile_image: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    password: str
    employee_code: str
    basic_salary: float = 0.0
    allowances: float = 0.0
    deductions: float = 0.0

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    joining_date: Optional[date] = None
    profile_image: Optional[str] = None

class EmployeeSelfUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_image: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    user_id: int
    employee_code: str
    full_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    attendance_date: date
    check_in: datetime
    check_out: Optional[datetime] = None
    status: str
    working_hours: float
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceStats(BaseModel):
    total_working_days: int
    present_days: int
    absent_days: int
    half_days: int
    leave_days: int
    attendance_percentage: float

# Leave Request Schemas
class LeaveRequestCreate(BaseModel):
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class LeaveRequestReview(BaseModel):
    admin_comment: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    admin_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Payroll Schemas
class PayrollUpdate(BaseModel):
    basic_salary: float
    allowances: float
    deductions: float

class PayrollResponse(BaseModel):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    basic_salary: float
    allowances: float
    deductions: float
    net_salary: float
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class RecentActivity(BaseModel):
    id: str
    type: str  # attendance, leave, payroll, employee
    title: str
    subtitle: str
    timestamp: str

class EmployeeDashboardResponse(BaseModel):
    welcome_message: str
    current_date: str
    today_attendance: Optional[AttendanceResponse] = None
    attendance_stats: AttendanceStats
    pending_leaves_count: int
    approved_leaves_count: int
    payroll_summary: Optional[PayrollResponse] = None
    recent_activity: List[RecentActivity]
    recent_attendance: List[AttendanceResponse]
    recent_leaves: List[LeaveRequestResponse]

class HRDashboardResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    on_leave_today: int
    pending_leaves_count: int
    weekly_attendance_trend: List[dict]
    leave_status_distribution: List[dict]
    recent_activity: List[RecentActivity]
    pending_leave_requests: List[LeaveRequestResponse]

# Prompt 2 Intelligence Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    description: str
    severity: str  # HIGH, MEDIUM, LOW
    category: str  # ATTENDANCE, LEAVE, WORKFORCE, PAYROLL
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SmartAlertResponse(BaseModel):
    id: str
    severity: str  # HIGH, MEDIUM, LOW
    category: str  # ATTENDANCE, LEAVE, WORKFORCE, PAYROLL
    title: str
    description: str
    employee_id: Optional[int] = None
    department: Optional[str] = None
    created_at: str
    recommended_action: str

class ActionItemResponse(BaseModel):
    id: str
    priority: str  # HIGH, MEDIUM, LOW
    category: str
    title: str
    explanation: str
    related_target: str  # Department or Employee Name
    recommended_action: str
    status: str

class DepartmentHealthResponse(BaseModel):
    department: str
    employee_count: int
    attendance_percentage: float
    availability_rate: float
    leave_count: int
    avg_working_hours: float
    health_score: int  # 0 to 100
    status: str  # HEALTHY (80-100), WATCH (60-79), NEEDS_ATTENTION (<60)
    factors: List[str]

class EmployeeInsightResponse(BaseModel):
    employee_id: int
    full_name: str
    employee_code: str
    department: str
    designation: str
    attendance_percentage: float
    dept_avg_attendance: float
    present_days: int
    absent_days: int
    half_days: int
    avg_working_hours: float
    leave_count: int
    pending_leave_count: int
    consecutive_absences: int
    operational_status: str  # HEALTHY, NEEDS_ATTENTION, CRITICAL
    status_reason: str
    recent_trend: List[dict]  # Date & hours/status
    recommended_action: str

class AnalyticsOverviewResponse(BaseModel):
    total_employees: int
    active_employees: int
    total_departments: int
    organization_attendance_pct: float
    employees_needing_attention_count: int
    department_health_scores: List[DepartmentHealthResponse]

class AttendanceAnalyticsResponse(BaseModel):
    weekly_trend: List[dict]
    department_comparison: List[dict]
    status_distribution: List[dict]
    overall_avg_working_hours: float

class LeaveAnalyticsResponse(BaseModel):
    paid_leave_count: int
    sick_leave_count: int
    unpaid_leave_count: int
    pending_count: int
    approved_count: int
    rejected_count: int

