from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin
from services.insights import (
    calculate_employee_insight,
    calculate_department_health,
    generate_smart_alerts,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview", response_model=schemas.AnalyticsOverviewResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    employees = db.query(models.Employee).all()
    total_employees = len(employees)
    active_user_ids = [u.id for u in db.query(models.User.id).filter(models.User.is_active == True).all()]
    active_employees = sum(1 for e in employees if e.user_id in active_user_ids)

    departments = sorted(list(set(e.department for e in employees)))
    total_departments = len(departments)

    # Department health list
    dept_healths = [calculate_department_health(db, d) for d in departments]

    # Organization attendance %
    all_atts = db.query(models.Attendance).all()
    if len(all_atts) > 0:
        present_c = sum(1 for a in all_atts if a.status == "Present")
        half_c = sum(1 for a in all_atts if a.status == "Half-Day")
        org_att_pct = round(((present_c + 0.5 * half_c) / len(all_atts)) * 100.0, 1)
    else:
        org_att_pct = 100.0

    # Employees needing attention
    attention_count = 0
    for emp in employees:
        insight = calculate_employee_insight(db, emp.id)
        if insight.operational_status in ("NEEDS_ATTENTION", "CRITICAL"):
            attention_count += 1

    return schemas.AnalyticsOverviewResponse(
        total_employees=total_employees,
        active_employees=active_employees,
        total_departments=total_departments,
        organization_attendance_pct=org_att_pct,
        employees_needing_attention_count=attention_count,
        department_health_scores=dept_healths,
    )

@router.get("/attendance", response_model=schemas.AttendanceAnalyticsResponse)
def get_attendance_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    employees = db.query(models.Employee).all()
    departments = sorted(list(set(e.department for e in employees)))

    # Department comparison
    dept_comparison = []
    for d in departments:
        dh = calculate_department_health(db, d)
        dept_comparison.append({
            "department": d,
            "attendance_percentage": dh.attendance_percentage,
            "avg_working_hours": dh.avg_working_hours,
            "employee_count": dh.employee_count,
            "health_score": dh.health_score,
            "status": dh.status,
        })

    # Status distribution
    all_atts = db.query(models.Attendance).all()
    present_c = sum(1 for a in all_atts if a.status == "Present")
    absent_c = sum(1 for a in all_atts if a.status == "Absent")
    half_c = sum(1 for a in all_atts if a.status == "Half-Day")
    leave_c = sum(1 for a in all_atts if a.status == "Leave")

    status_dist = [
        {"name": "Present", "value": present_c, "color": "#10b981"},
        {"name": "Absent", "value": absent_c, "color": "#ef4444"},
        {"name": "Half-Day", "value": half_c, "color": "#f59e0b"},
        {"name": "On Leave", "value": leave_c, "color": "#6366f1"},
    ]

    overall_avg_hours = round(sum(a.working_hours for a in all_atts) / len(all_atts), 1) if len(all_atts) > 0 else 8.0

    return schemas.AttendanceAnalyticsResponse(
        weekly_trend=[],  # Filled dynamically on UI or via hr dashboard endpoint
        department_comparison=dept_comparison,
        status_distribution=status_dist,
        overall_avg_working_hours=overall_avg_hours,
    )

@router.get("/leaves", response_model=schemas.LeaveAnalyticsResponse)
def get_leave_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    all_leaves = db.query(models.LeaveRequest).all()

    return schemas.LeaveAnalyticsResponse(
        paid_leave_count=sum(1 for l in all_leaves if l.leave_type == "Paid Leave"),
        sick_leave_count=sum(1 for l in all_leaves if l.leave_type == "Sick Leave"),
        unpaid_leave_count=sum(1 for l in all_leaves if l.leave_type == "Unpaid Leave"),
        pending_count=sum(1 for l in all_leaves if l.status == "Pending"),
        approved_count=sum(1 for l in all_leaves if l.status == "Approved"),
        rejected_count=sum(1 for l in all_leaves if l.status == "Rejected"),
    )

@router.get("/departments", response_model=List[schemas.DepartmentHealthResponse])
def get_department_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    employees = db.query(models.Employee).all()
    departments = sorted(list(set(e.department for e in employees)))
    return [calculate_department_health(db, d) for d in departments]

@router.get("/employee/{employee_id}", response_model=schemas.EmployeeInsightResponse)
def get_employee_analytics(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "EMPLOYEE" and current_user.employee.id != employee_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access another employee's analytics")

    return calculate_employee_insight(db, employee_id)
