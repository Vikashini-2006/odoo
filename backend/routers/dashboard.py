from datetime import datetime, date, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin, get_current_employee_user
from routers.attendance import format_attendance_response
from routers.leaves import format_leave_response
from routers.payroll import format_payroll_response

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/employee", response_model=schemas.EmployeeDashboardResponse)
def get_employee_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    emp = current_user.employee
    if not emp:
        # If user is HR Admin without employee record, raise or handle
        raise HTTPException(status_code=400, detail="Employee profile not found")

    today = date.today()
    today_str = today.strftime("%A, %B %d, %Y")

    # 1. Today's attendance
    today_att = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id,
        models.Attendance.attendance_date == today,
    ).first()
    today_att_resp = format_attendance_response(today_att) if today_att else None

    # 2. Attendance stats
    all_att = db.query(models.Attendance).filter(models.Attendance.employee_id == emp.id).all()
    total_days = len(all_att)
    present_days = sum(1 for a in all_att if a.status == "Present")
    absent_days = sum(1 for a in all_att if a.status == "Absent")
    half_days = sum(1 for a in all_att if a.status == "Half-Day")
    leave_days = sum(1 for a in all_att if a.status == "Leave")
    pct = round(((present_days + 0.5 * half_days) / total_days) * 100.0, 1) if total_days > 0 else 100.0

    stats = schemas.AttendanceStats(
        total_working_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        half_days=half_days,
        leave_days=leave_days,
        attendance_percentage=pct,
    )

    # 3. Leaves count
    leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.employee_id == emp.id).all()
    pending_leaves = sum(1 for l in leaves if l.status == "Pending")
    approved_leaves = sum(1 for l in leaves if l.status == "Approved")

    # 4. Payroll
    pr = db.query(models.Payroll).filter(models.Payroll.employee_id == emp.id).first()
    payroll_resp = format_payroll_response(pr) if pr else None

    # 5. Recent activity
    activities = []
    if today_att:
        activities.append(schemas.RecentActivity(
            id=f"att-{today_att.id}",
            type="attendance",
            title="Checked In Today",
            subtitle=f"Status: {today_att.status} at {today_att.check_in.strftime('%I:%M %p')}",
            timestamp=today_att.check_in.strftime("%b %d, %I:%M %p"),
        ))
    for l in sorted(leaves, key=lambda x: x.created_at, reverse=True)[:3]:
        activities.append(schemas.RecentActivity(
            id=f"leave-{l.id}",
            type="leave",
            title=f"Leave Request: {l.leave_type}",
            subtitle=f"Status: {l.status} ({l.start_date} to {l.end_date})",
            timestamp=l.created_at.strftime("%b %d, %I:%M %p"),
        ))

    # 6. Recent attendance list (last 7)
    recent_att = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.id)
        .order_by(models.Attendance.attendance_date.desc())
        .limit(7)
        .all()
    )

    # 7. Recent leave requests list (last 5)
    recent_leaves = (
        db.query(models.LeaveRequest)
        .filter(models.LeaveRequest.employee_id == emp.id)
        .order_by(models.LeaveRequest.created_at.desc())
        .limit(5)
        .all()
    )

    return schemas.EmployeeDashboardResponse(
        welcome_message=f"Welcome back, {emp.first_name}!",
        current_date=today_str,
        today_attendance=today_att_resp,
        attendance_stats=stats,
        pending_leaves_count=pending_leaves,
        approved_leaves_count=approved_leaves,
        payroll_summary=payroll_resp,
        recent_activity=activities,
        recent_attendance=[format_attendance_response(a) for a in recent_att],
        recent_leaves=[format_leave_response(l) for l in recent_leaves],
    )

@router.get("/hr", response_model=schemas.HRDashboardResponse)
def get_hr_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    today = date.today()

    # 1. Total Employees
    total_employees = db.query(models.Employee).count()

    # 2. Today's attendance counts
    today_attendances = db.query(models.Attendance).filter(models.Attendance.attendance_date == today).all()
    present_today = sum(1 for a in today_attendances if a.status in ("Present", "Half-Day"))
    on_leave_today = sum(1 for a in today_attendances if a.status == "Leave")
    absent_today = max(0, total_employees - present_today - on_leave_today)

    # 3. Pending leave requests count
    pending_leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "Pending").order_by(models.LeaveRequest.created_at.desc()).all()
    pending_count = len(pending_leaves)

    # 4. Weekly attendance trend (past 7 calendar days)
    weekly_trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_atts = db.query(models.Attendance).filter(models.Attendance.attendance_date == d).all()
        p_count = sum(1 for a in day_atts if a.status == "Present")
        h_count = sum(1 for a in day_atts if a.status == "Half-Day")
        l_count = sum(1 for a in day_atts if a.status == "Leave")
        a_count = sum(1 for a in day_atts if a.status == "Absent")
        
        # If weekend and no records, keep 0s
        weekly_trend.append({
            "day": d.strftime("%a"),
            "date": d.strftime("%b %d"),
            "present": p_count,
            "half_day": h_count,
            "leave": l_count,
            "absent": a_count,
        })

    # 5. Leave status distribution
    all_leaves = db.query(models.LeaveRequest).all()
    paid_count = sum(1 for l in all_leaves if l.leave_type == "Paid Leave")
    sick_count = sum(1 for l in all_leaves if l.leave_type == "Sick Leave")
    unpaid_count = sum(1 for l in all_leaves if l.leave_type == "Unpaid Leave")

    leave_dist = [
        {"name": "Paid Leave", "value": paid_count, "color": "#6366f1"},
        {"name": "Sick Leave", "value": sick_count, "color": "#10b981"},
        {"name": "Unpaid Leave", "value": unpaid_count, "color": "#f59e0b"},
    ]

    # 6. Recent activity (system-wide)
    recent_activity = []
    latest_leaves = sorted(all_leaves, key=lambda x: x.created_at, reverse=True)[:4]
    for l in latest_leaves:
        emp_name = l.employee.full_name if l.employee else "Employee"
        recent_activity.append(schemas.RecentActivity(
            id=f"hr-leave-{l.id}",
            type="leave",
            title=f"Leave Submitted by {emp_name}",
            subtitle=f"{l.leave_type} ({l.start_date} to {l.end_date}) - Status: {l.status}",
            timestamp=l.created_at.strftime("%b %d, %I:%M %p"),
        ))

    latest_atts = db.query(models.Attendance).order_by(models.Attendance.created_at.desc()).limit(3).all()
    for a in latest_atts:
        emp_name = a.employee.full_name if a.employee else "Employee"
        recent_activity.append(schemas.RecentActivity(
            id=f"hr-att-{a.id}",
            type="attendance",
            title=f"Attendance Logged: {emp_name}",
            subtitle=f"Status: {a.status} on {a.attendance_date}",
            timestamp=a.created_at.strftime("%b %d, %I:%M %p"),
        ))

    return schemas.HRDashboardResponse(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        on_leave_today=on_leave_today,
        pending_leaves_count=pending_count,
        weekly_attendance_trend=weekly_trend,
        leave_status_distribution=leave_dist,
        recent_activity=recent_activity[:6],
        pending_leave_requests=[format_leave_response(l) for l in pending_leaves[:5]],
    )
