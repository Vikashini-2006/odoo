from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin, get_current_employee_user

router = APIRouter(prefix="/api/payroll", tags=["Payroll"])

def format_payroll_response(pr: models.Payroll) -> schemas.PayrollResponse:
    emp = pr.employee
    return schemas.PayrollResponse(
        id=pr.id,
        employee_id=pr.employee_id,
        employee_name=emp.full_name if emp else "Unknown",
        employee_code=emp.employee_code if emp else "",
        department=emp.department if emp else "",
        designation=emp.designation if emp else "",
        basic_salary=pr.basic_salary,
        allowances=pr.allowances,
        deductions=pr.deductions,
        net_salary=pr.net_salary,
        updated_at=pr.updated_at,
    )

@router.get("/my", response_model=schemas.PayrollResponse)
def get_my_payroll(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_employee_user),
):
    emp = current_user.employee
    payroll = db.query(models.Payroll).filter(models.Payroll.employee_id == emp.id).first()
    if not payroll:
        # Create default if missing
        payroll = models.Payroll(
            employee_id=emp.id,
            basic_salary=5000.0,
            allowances=1000.0,
            deductions=500.0,
            net_salary=5500.0,
        )
        db.add(payroll)
        db.commit()
        db.refresh(payroll)
    return format_payroll_response(payroll)

@router.get("", response_model=List[schemas.PayrollResponse])
def get_all_payrolls(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    payrolls = db.query(models.Payroll).join(models.Employee).all()
    return [format_payroll_response(p) for p in payrolls]

@router.put("/{employee_id}", response_model=schemas.PayrollResponse)
def update_payroll(
    employee_id: int,
    payload: schemas.PayrollUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    payroll = db.query(models.Payroll).filter(models.Payroll.employee_id == employee_id).first()
    if not payroll:
        payroll = models.Payroll(employee_id=employee_id)
        db.add(payroll)

    payroll.basic_salary = max(0.0, payload.basic_salary)
    payroll.allowances = max(0.0, payload.allowances)
    payroll.deductions = max(0.0, payload.deductions)
    # Formula enforcement: net = basic + allowances - deductions
    payroll.net_salary = max(0.0, payroll.basic_salary + payroll.allowances - payroll.deductions)

    db.commit()
    db.refresh(payroll)
    return format_payroll_response(payroll)
