from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin, get_current_employee_user

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])

def format_leave_response(lr: models.LeaveRequest) -> schemas.LeaveRequestResponse:
    emp = lr.employee
    return schemas.LeaveRequestResponse(
        id=lr.id,
        employee_id=lr.employee_id,
        employee_name=emp.full_name if emp else "Unknown",
        employee_code=emp.employee_code if emp else "",
        department=emp.department if emp else "",
        leave_type=lr.leave_type,
        start_date=lr.start_date,
        end_date=lr.end_date,
        reason=lr.reason,
        status=lr.status,
        admin_comment=lr.admin_comment,
        created_at=lr.created_at,
        updated_at=lr.updated_at,
    )

@router.post("", response_model=schemas.LeaveRequestResponse, status_code=status.HTTP_201_CREATED)
def apply_leave(
    payload: schemas.LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    if payload.start_date > payload.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start date cannot be after end date.",
        )

    emp = current_user.employee
    lr = models.LeaveRequest(
        employee_id=emp.id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason.strip(),
        status="Pending",
        admin_comment=None,
    )
    db.add(lr)
    db.commit()
    db.refresh(lr)
    return format_leave_response(lr)

@router.get("/my", response_model=List[schemas.LeaveRequestResponse])
def get_my_leaves(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    emp = current_user.employee
    leaves = (
        db.query(models.LeaveRequest)
        .filter(models.LeaveRequest.employee_id == emp.id)
        .order_by(models.LeaveRequest.created_at.desc())
        .all()
    )
    return [format_leave_response(l) for l in leaves]

@router.get("", response_model=List[schemas.LeaveRequestResponse])
def get_all_leaves(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: Pending, Approved, Rejected"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    query = db.query(models.LeaveRequest).join(models.Employee)

    if status_filter and status_filter.strip():
        query = query.filter(models.LeaveRequest.status == status_filter.strip())
    if department and department.strip():
        query = query.filter(models.Employee.department == department.strip())

    leaves = query.order_by(models.LeaveRequest.created_at.desc()).all()
    return [format_leave_response(l) for l in leaves]

@router.put("/{leave_id}/approve", response_model=schemas.LeaveRequestResponse)
def approve_leave(
    leave_id: int,
    payload: schemas.LeaveRequestReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    lr = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not lr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    lr.status = "Approved"
    if payload.admin_comment is not None:
        lr.admin_comment = payload.admin_comment.strip()

    db.commit()
    db.refresh(lr)
    return format_leave_response(lr)

@router.put("/{leave_id}/reject", response_model=schemas.LeaveRequestResponse)
def reject_leave(
    leave_id: int,
    payload: schemas.LeaveRequestReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    lr = db.query(models.LeaveRequest).filter(models.LeaveRequest.id == leave_id).first()
    if not lr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave request not found",
        )

    lr.status = "Rejected"
    if payload.admin_comment is not None:
        lr.admin_comment = payload.admin_comment.strip()

    db.commit()
    db.refresh(lr)
    return format_leave_response(lr)
