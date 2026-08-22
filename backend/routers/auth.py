from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
import auth
from dependencies import get_db, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    access_token = auth.create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role}
    )

    emp_id = user.employee.id if user.employee else None
    full_name = user.employee.full_name if user.employee else user.email
    emp_code = user.employee.employee_code if user.employee else None
    profile_image = user.employee.profile_image if user.employee else None

    user_resp = schemas.UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        employee_id=emp_id,
        full_name=full_name,
        employee_code=emp_code,
        profile_image=profile_image,
    )

    return {"access_token": access_token, "token_type": "bearer", "user": user_resp}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    emp_id = current_user.employee.id if current_user.employee else None
    full_name = current_user.employee.full_name if current_user.employee else current_user.email
    emp_code = current_user.employee.employee_code if current_user.employee else None
    profile_image = current_user.employee.profile_image if current_user.employee else None

    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        employee_id=emp_id,
        full_name=full_name,
        employee_code=emp_code,
        profile_image=profile_image,
    )
