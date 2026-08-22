from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin, get_current_employee_user

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

def format_attendance_response(att: models.Attendance) -> schemas.AttendanceResponse:
    emp = att.employee
    return schemas.AttendanceResponse(
        id=att.id,
        employee_id=att.employee_id,
        employee_name=emp.full_name if emp else "Unknown",
        employee_code=emp.employee_code if emp else "",
        department=emp.department if emp else "",
        attendance_date=att.attendance_date,
        check_in=att.check_in,
        check_out=att.check_out,
        status=att.status,
        working_hours=att.working_hours,
        created_at=att.created_at,
    )

@router.post("/check-in", response_model=schemas.AttendanceResponse)
def check_in(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    emp = current_user.employee
    today = date.today()

    existing = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id,
        models.Attendance.attendance_date == today,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already checked in for today.",
        )

    now = datetime.now()
    att = models.Attendance(
        employee_id=emp.id,
        attendance_date=today,
        check_in=now,
        check_out=None,
        status="Present",
        working_hours=0.0,
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return format_attendance_response(att)

@router.post("/check-out", response_model=schemas.AttendanceResponse)
def check_out(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    emp = current_user.employee
    today = date.today()

    att = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp.id,
        models.Attendance.attendance_date == today,
    ).first()

    if not att:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No check-in record found for today. Please check in first.",
        )

    if att.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already checked out for today.",
        )

    now = datetime.now()
    att.check_out = now
    
    # Calculate working hours safely
    delta = now - att.check_in
    hours = round(delta.total_seconds() / 3600.0, 2)
    att.working_hours = hours

    if hours < 4.0:
        att.status = "Half-Day"
    else:
        att.status = "Present"

    db.commit()
    db.refresh(att)
    return format_attendance_response(att)

@router.get("/my", response_model=List[schemas.AttendanceResponse])
def get_my_attendance(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    emp = current_user.employee
    attendances = (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == emp.id)
        .order_by(models.Attendance.attendance_date.desc())
        .all()
    )
    return [format_attendance_response(a) for a in attendances]

@router.get("/all", response_model=List[schemas.AttendanceResponse])
def get_all_attendance(
    target_date: Optional[date] = Query(None, description="Filter by date"),
    department: Optional[str] = Query(None, description="Filter by department"),
    employee_id: Optional[int] = Query(None, description="Filter by employee ID"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    query = db.query(models.Attendance).join(models.Employee)

    if target_date:
        query = query.filter(models.Attendance.attendance_date == target_date)
    if department and department.strip():
        query = query.filter(models.Employee.department == department.strip())
    if employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)

    attendances = query.order_by(models.Attendance.attendance_date.desc()).all()
    return [format_attendance_response(a) for a in attendances]

@router.get("/stats", response_model=schemas.AttendanceStats)
def get_attendance_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "EMPLOYEE":
        if not current_user.employee:
            raise HTTPException(status_code=400, detail="Employee record missing")
        emp_id = current_user.employee.id
        attendances = db.query(models.Attendance).filter(models.Attendance.employee_id == emp_id).all()
    else:
        attendances = db.query(models.Attendance).all()

    total_days = len(attendances)
    present_days = sum(1 for a in attendances if a.status == "Present")
    absent_days = sum(1 for a in attendances if a.status == "Absent")
    half_days = sum(1 for a in attendances if a.status == "Half-Day")
    leave_days = sum(1 for a in attendances if a.status == "Leave")

    if total_days > 0:
        pct = round(((present_days + 0.5 * half_days) / total_days) * 100.0, 1)
    else:
        pct = 100.0

    return schemas.AttendanceStats(
        total_working_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
        half_days=half_days,
        leave_days=leave_days,
        attendance_percentage=pct,
    )
