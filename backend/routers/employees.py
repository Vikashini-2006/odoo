from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
import auth
from dependencies import get_db, get_current_user, get_current_hr_admin

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("", response_model=List[schemas.EmployeeResponse])
def get_employees(
    search: Optional[str] = Query(None, description="Search by name, email, or employee code"),
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    query = db.query(models.Employee)

    if department and department.strip():
        query = query.filter(models.Employee.department == department.strip())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (models.Employee.full_name.ilike(term))
            | (models.Employee.email.ilike(term))
            | (models.Employee.employee_code.ilike(term))
        )

    employees = query.order_by(models.Employee.joining_date.desc()).all()
    return employees

@router.post("", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    # Check duplicate email in Users & Employees
    existing_user = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    existing_code = db.query(models.Employee).filter(models.Employee.employee_code == payload.employee_code).first()
    if existing_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee code already exists",
        )

    # 1. Create User
    pwd_hash = auth.get_password_hash(payload.password)
    user = models.User(
        email=payload.email,
        password_hash=pwd_hash,
        role="EMPLOYEE",
        is_active=True,
    )
    db.add(user)
    db.flush()

    # 2. Create Employee
    full_name = f"{payload.first_name.strip()} {payload.last_name.strip()}"
    employee = models.Employee(
        user_id=user.id,
        employee_code=payload.employee_code.strip(),
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        full_name=full_name,
        email=payload.email.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        address=payload.address.strip() if payload.address else None,
        department=payload.department.strip(),
        designation=payload.designation.strip(),
        joining_date=payload.joining_date,
        profile_image=payload.profile_image.strip() if payload.profile_image else None,
    )
    db.add(employee)
    db.flush()

    # 3. Create Payroll
    basic = payload.basic_salary or 0.0
    allowances = payload.allowances or 0.0
    deductions = payload.deductions or 0.0
    net_salary = basic + allowances - deductions

    payroll = models.Payroll(
        employee_id=employee.id,
        basic_salary=basic,
        allowances=allowances,
        deductions=deductions,
        net_salary=net_salary,
    )
    db.add(payroll)

    db.commit()
    db.refresh(employee)
    return employee

@router.get("/{employee_id}", response_model=schemas.EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    # Employee role can only access their own profile
    if current_user.role == "EMPLOYEE" and current_user.employee.id != employee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Cannot access another employee's details",
        )

    return employee

@router.put("/{employee_id}", response_model=schemas.EmployeeResponse)
def update_employee(
    employee_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    if current_user.role == "HR_ADMIN":
        # HR Admin can update any permitted field
        for field in ["first_name", "last_name", "phone", "address", "department", "designation", "profile_image"]:
            if field in payload and payload[field] is not None:
                setattr(employee, field, payload[field])
        if "first_name" in payload or "last_name" in payload:
            fn = payload.get("first_name", employee.first_name)
            ln = payload.get("last_name", employee.last_name)
            employee.full_name = f"{fn} {ln}"
    else:
        # Employee can only update self, and only phone, address, profile_image
        if current_user.employee.id != employee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Cannot update another employee's profile",
            )
        for field in ["phone", "address", "profile_image"]:
            if field in payload and payload[field] is not None:
                setattr(employee, field, payload[field])

    db.commit()
    db.refresh(employee)
    return employee
