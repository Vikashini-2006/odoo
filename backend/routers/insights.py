from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user, get_current_hr_admin
from services.insights import (
    calculate_employee_insight,
    generate_smart_alerts,
    generate_action_center_items,
)

router = APIRouter(prefix="/api/insights", tags=["Insights"])

@router.get("/actions", response_model=List[schemas.ActionItemResponse])
def get_action_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    return generate_action_center_items(db)

@router.get("/alerts", response_model=List[schemas.SmartAlertResponse])
def get_smart_alerts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_hr_admin),
):
    return generate_smart_alerts(db)

@router.get("/employee/{employee_id}", response_model=schemas.EmployeeInsightResponse)
def get_employee_insight_api(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "EMPLOYEE" and current_user.employee.id != employee_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot access another employee's insights")

    return calculate_employee_insight(db, employee_id)
