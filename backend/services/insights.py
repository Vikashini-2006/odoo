from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas

def calculate_employee_insight(db: Session, employee_id: int) -> schemas.EmployeeInsightResponse:
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise ValueError("Employee not found")

    attendances = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee_id)
        .order_by(models.Attendance.attendance_date.desc())
        .all()
    )

    total_days = len(attendances)
    present_days = sum(1 for a in attendances if a.status == "Present")
    absent_days = sum(1 for a in attendances if a.status == "Absent")
    half_days = sum(1 for a in attendances if a.status == "Half-Day")
    
    if total_days > 0:
        att_pct = round(((present_days + 0.5 * half_days) / total_days) * 100.0, 1)
        avg_hours = round(sum(a.working_hours for a in attendances) / total_days, 1)
    else:
        att_pct = 100.0
        avg_hours = 8.0

    # Department Average Calculation
    dept_employees = db.query(models.Employee.id).filter(models.Employee.department == emp.department).all()
    dept_emp_ids = [e.id for e in dept_employees]
    dept_atts = db.query(models.Attendance).filter(models.Attendance.employee_id.in_(dept_emp_ids)).all()
    dept_total = len(dept_atts)
    if dept_total > 0:
        dept_present = sum(1 for a in dept_atts if a.status == "Present")
        dept_half = sum(1 for a in dept_atts if a.status == "Half-Day")
        dept_avg_pct = round(((dept_present + 0.5 * dept_half) / dept_total) * 100.0, 1)
    else:
        dept_avg_pct = 100.0

    # Consecutive Absences Count
    consecutive_absences = 0
    for a in attendances:
        if a.status == "Absent":
            consecutive_absences += 1
        else:
            break

    # Leave Stats
    leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.employee_id == employee_id).all()
    leave_count = len(leaves)
    pending_leave_count = sum(1 for l in leaves if l.status == "Pending")

    # Operational Classification
    if att_pct < 70.0 or consecutive_absences >= 3:
        status_val = "CRITICAL"
        reason = f"Attendance rate ({att_pct}%) is below operational threshold."
        rec = "Review recent attendance logs and discuss schedule alignment with the employee."
    elif att_pct < 85.0 or consecutive_absences >= 2:
        status_val = "NEEDS_ATTENTION"
        reason = f"Attendance rate ({att_pct}%) is lower than department average ({dept_avg_pct}%)."
        rec = "Monitor attendance patterns for the upcoming work cycles."
    else:
        status_val = "HEALTHY"
        reason = "Attendance and working hours comply with operational standards."
        rec = "No immediate action required. Maintain current work schedule."

    # Recent Trend (last 7 recorded days)
    recent_trend = []
    for a in attendances[:7]:
        recent_trend.append({
            "date": a.attendance_date.strftime("%b %d"),
            "hours": a.working_hours,
            "status": a.status
        })
    recent_trend.reverse()

    return schemas.EmployeeInsightResponse(
        employee_id=emp.id,
        full_name=emp.full_name,
        employee_code=emp.employee_code,
        department=emp.department,
        designation=emp.designation,
        attendance_percentage=att_pct,
        dept_avg_attendance=dept_avg_pct,
        present_days=present_days,
        absent_days=absent_days,
        half_days=half_days,
        avg_working_hours=avg_hours,
        leave_count=leave_count,
        pending_leave_count=pending_leave_count,
        consecutive_absences=consecutive_absences,
        operational_status=status_val,
        status_reason=reason,
        recent_trend=recent_trend,
        recommended_action=rec,
    )


def calculate_department_health(db: Session, department: str) -> schemas.DepartmentHealthResponse:
    dept_employees = db.query(models.Employee).filter(models.Employee.department == department).all()
    emp_count = len(dept_employees)
    if emp_count == 0:
        return schemas.DepartmentHealthResponse(
            department=department,
            employee_count=0,
            attendance_percentage=100.0,
            availability_rate=100.0,
            leave_count=0,
            avg_working_hours=0.0,
            health_score=100,
            status="HEALTHY",
            factors=["No active records for department."]
        )

    emp_ids = [e.id for e in dept_employees]
    atts = db.query(models.Attendance).filter(models.Attendance.employee_id.in_(emp_ids)).all()
    total_records = len(atts)

    if total_records > 0:
        present_count = sum(1 for a in atts if a.status == "Present")
        half_count = sum(1 for a in atts if a.status == "Half-Day")
        leave_status_count = sum(1 for a in atts if a.status == "Leave")
        att_pct = round(((present_count + 0.5 * half_count) / total_records) * 100.0, 1)
        avail_rate = round(((total_records - leave_status_count) / total_records) * 100.0, 1)
        avg_hours = round(sum(a.working_hours for a in atts) / total_records, 1)
    else:
        att_pct = 100.0
        avail_rate = 100.0
        avg_hours = 8.0

    leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.employee_id.in_(emp_ids)).all()
    leave_count = len(leaves)

    # Health Score Formula (0 - 100):
    # Score = int(att_pct * 0.6 + avail_rate * 0.4)
    score = int(min(100, max(0, att_pct * 0.6 + avail_rate * 0.4)))

    if score >= 80:
        status_val = "HEALTHY"
    elif score >= 60:
        status_val = "WATCH"
    else:
        status_val = "NEEDS_ATTENTION"

    factors = [
        f"Attendance Rate: {att_pct}%",
        f"Workforce Availability: {avail_rate}%",
        f"Average Working Hours: {avg_hours} hrs/day",
        f"Active Leave Applications: {leave_count}"
    ]

    return schemas.DepartmentHealthResponse(
        department=department,
        employee_count=emp_count,
        attendance_percentage=att_pct,
        availability_rate=avail_rate,
        leave_count=leave_count,
        avg_working_hours=avg_hours,
        health_score=score,
        status=status_val,
        factors=factors,
    )


def generate_smart_alerts(db: Session) -> List[schemas.SmartAlertResponse]:
    alerts = []
    employees = db.query(models.Employee).all()
    today_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    # 1. Check Low Employee Attendance (< 75%)
    for emp in employees:
        insight = calculate_employee_insight(db, emp.id)
        if insight.attendance_percentage < 75.0:
            alerts.append(schemas.SmartAlertResponse(
                id=f"alert-att-emp-{emp.id}",
                severity="HIGH" if insight.attendance_percentage < 65.0 else "MEDIUM",
                category="ATTENDANCE",
                title=f"Low Attendance: {emp.full_name}",
                description=f"Attendance rate is {insight.attendance_percentage}% ({insight.absent_days} absences recorded).",
                employee_id=emp.id,
                department=emp.department,
                created_at=today_str,
                recommended_action="Review employee attendance log and verify scheduling conflicts."
            ))

        if insight.consecutive_absences >= 2:
            alerts.append(schemas.SmartAlertResponse(
                id=f"alert-abs-emp-{emp.id}",
                severity="HIGH",
                category="ATTENDANCE",
                title=f"Consecutive Absences: {emp.full_name}",
                description=f"Recorded {insight.consecutive_absences} consecutive unexcused absences.",
                employee_id=emp.id,
                department=emp.department,
                created_at=today_str,
                recommended_action="Contact employee to verify leave documentation."
            ))

    # 2. Check Pending Leave Requests Queue
    pending_leaves = db.query(models.LeaveRequest).filter(models.LeaveRequest.status == "Pending").all()
    if len(pending_leaves) > 0:
        alerts.append(schemas.SmartAlertResponse(
            id="alert-leave-pending-queue",
            severity="HIGH" if len(pending_leaves) >= 3 else "MEDIUM",
            category="LEAVE",
            title=f"Pending Leave Requests ({len(pending_leaves)})",
            description=f"{len(pending_leaves)} leave requests are currently awaiting HR review.",
            employee_id=None,
            department=None,
            created_at=today_str,
            recommended_action="Access Leave Approvals portal to process pending applications."
        ))

    # 3. Department Health Checks
    departments = list(set(e.department for e in employees))
    for dept in departments:
        dept_health = calculate_department_health(db, dept)
        if dept_health.status == "NEEDS_ATTENTION":
            alerts.append(schemas.SmartAlertResponse(
                id=f"alert-dept-{dept.lower().replace(' ', '-')}",
                severity="HIGH",
                category="WORKFORCE",
                title=f"Department Attention: {dept}",
                description=f"Department health score is {dept_health.health_score}/100 (Attendance: {dept_health.attendance_percentage}%).",
                employee_id=None,
                department=dept,
                created_at=today_str,
                recommended_action=f"Review workforce availability and schedule density in {dept}."
            ))

    # 4. Check Payroll Net Mismatches
    payrolls = db.query(models.Payroll).all()
    for py in payrolls:
        expected_net = py.basic_salary + py.allowances - py.deductions
        if abs(py.net_salary - expected_net) > 0.01:
            emp = py.employee
            alerts.append(schemas.SmartAlertResponse(
                id=f"alert-pay-{py.id}",
                severity="HIGH",
                category="PAYROLL",
                title=f"Payroll Mismatch: {emp.full_name if emp else 'Unknown'}",
                description=f"Net salary (${py.net_salary}) does not equal basic + allowances - deductions (${expected_net}).",
                employee_id=py.employee_id,
                department=emp.department if emp else None,
                created_at=today_str,
                recommended_action="Re-calculate and save payroll figures in Payroll Manager."
            ))

    return alerts


def generate_action_center_items(db: Session) -> List[schemas.ActionItemResponse]:
    actions = []
    alerts = generate_smart_alerts(db)

    for idx, alert in enumerate(alerts):
        actions.append(schemas.ActionItemResponse(
            id=f"action-{idx+1}",
            priority=alert.severity,
            category=alert.category,
            title=alert.title,
            explanation=alert.description,
            related_target=alert.department or (f"Employee #{alert.employee_id}" if alert.employee_id else "Organization"),
            recommended_action=alert.recommended_action,
            status="ACTION_REQUIRED" if alert.severity in ("HIGH", "MEDIUM") else "MONITORING"
        ))

    # Add a fallback positive action if all clear
    if len(actions) == 0:
        actions.append(schemas.ActionItemResponse(
            id="action-healthy-default",
            priority="LOW",
            category="WORKFORCE",
            title="Workforce Operations Stable",
            explanation="All department health scores and attendance benchmarks conform to operational targets.",
            related_target="Organization",
            recommended_action="No immediate action required.",
            status="STABLE"
        ))

    return actions


def sync_notifications(db: Session):
    alerts = generate_smart_alerts(db)

    # Get existing title set
    existing_titles = set(n.title for n in db.query(models.Notification).all())

    for a in alerts:
        if a.title not in existing_titles:
            notif = models.Notification(
                user_id=None,  # System-wide HR notification
                title=a.title,
                description=a.description,
                severity=a.severity,
                category=a.category,
                is_read=False,
            )
            db.add(notif)

    db.commit()
