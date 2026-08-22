from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from dependencies import get_db, get_current_user
from services.insights import sync_notifications

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "HR_ADMIN":
        # Synchronize latest smart alerts into notifications DB table
        sync_notifications(db)
        # HR gets all system notifications + direct notifications
        notifications = (
            db.query(models.Notification)
            .order_by(models.Notification.is_read.asc(), models.Notification.created_at.desc())
            .all()
        )
    else:
        notifications = (
            db.query(models.Notification)
            .filter(models.Notification.user_id == current_user.id)
            .order_by(models.Notification.is_read.asc(), models.Notification.created_at.desc())
            .all()
        )

    return notifications

@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role == "HR_ADMIN":
        db.query(models.Notification).update({"is_read": True})
    else:
        db.query(models.Notification).filter(models.Notification.user_id == current_user.id).update({"is_read": True})

    db.commit()
    return {"message": "All notifications marked as read"}
