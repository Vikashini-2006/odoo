import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from seed import seed_database

# Routers
from routers import auth, employees, attendance, leaves, payroll, dashboard, analytics, insights, notifications

# 1. Initialize Tables
Base.metadata.create_all(bind=engine)

# 2. Seed Initial Demo Data if Empty
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

# 3. Create FastAPI Application
app = FastAPI(
    title="DAYFLOW HRMS API",
    description="Backend REST API for Dayflow Human Resource Management System",
    version="1.0.0",
)

# 4. Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Include API Routers
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(leaves.router)
app.include_router(payroll.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
app.include_router(insights.router)
app.include_router(notifications.router)


@app.get("/")
def read_root():
    return {
        "app": "DAYFLOW HRMS",
        "tagline": "Every Workday, Perfectly Aligned.",
        "status": "online",
        "version": "1.0.0",
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
