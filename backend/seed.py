from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
import models
import auth

def seed_database(db: Session):
    # Check if database is already seeded
    existing_user = db.query(models.User).first()
    if existing_user:
        print("Database already contains data. Skipping seed.")
        return

    print("Seeding database with realistic initial data...")

    # 1. Create HR Admin User & Employee
    hr_password = auth.get_password_hash("Admin@123")
    hr_user = models.User(
        email="hr@dayflow.com",
        password_hash=hr_password,
        role="HR_ADMIN",
        is_active=True,
    )
    db.add(hr_user)
    db.flush()

    hr_employee = models.Employee(
        user_id=hr_user.id,
        employee_code="HR-001",
        first_name="Eleanor",
        last_name="Vance",
        full_name="Eleanor Vance",
        email="hr@dayflow.com",
        phone="+1 (555) 019-2834",
        address="742 Evergreen Terrace, San Francisco, CA",
        department="Human Resources",
        designation="Head of People & HR Director",
        joining_date=date(2022, 1, 15),
        profile_image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    )
    db.add(hr_employee)
    db.flush()

    hr_payroll = models.Payroll(
        employee_id=hr_employee.id,
        basic_salary=11000.0,
        allowances=2500.0,
        deductions=1500.0,
        net_salary=12000.0,
    )
    db.add(hr_payroll)

    # 2. Define 8 realistic employees
    employees_data = [
        {
            "code": "EMP-101",
            "first_name": "Alex",
            "last_name": "Rivera",
            "email": "alex.dev@dayflow.com",
            "phone": "+1 (555) 123-4567",
            "address": "123 Technology Way, San Jose, CA",
            "dept": "Engineering",
            "desig": "Lead Full-Stack Engineer",
            "join": date(2023, 3, 1),
            "image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "basic": 9500.0, "allow": 1500.0, "deduct": 1000.0
        },
        {
            "code": "EMP-102",
            "first_name": "Sarah",
            "last_name": "Chen",
            "email": "sarah.design@dayflow.com",
            "phone": "+1 (555) 234-5678",
            "address": "456 Creative Blvd, Oakland, CA",
            "dept": "Engineering",
            "desig": "Senior Product Designer",
            "join": date(2023, 5, 10),
            "image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            "basic": 8800.0, "allow": 1200.0, "deduct": 900.0
        },
        {
            "code": "EMP-103",
            "first_name": "Michael",
            "last_name": "Ross",
            "email": "michael.hr@dayflow.com",
            "phone": "+1 (555) 345-6789",
            "address": "789 People Lane, San Francisco, CA",
            "dept": "Human Resources",
            "desig": "HR Operations Specialist",
            "join": date(2023, 8, 1),
            "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            "basic": 7200.0, "allow": 1000.0, "deduct": 700.0
        },
        {
            "code": "EMP-104",
            "first_name": "Emily",
            "last_name": "Watson",
            "email": "emily.finance@dayflow.com",
            "phone": "+1 (555) 456-7890",
            "address": "321 Financial District, San Francisco, CA",
            "dept": "Finance",
            "desig": "Senior Financial Analyst",
            "join": date(2022, 11, 15),
            "image": "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80",
            "basic": 8500.0, "allow": 1300.0, "deduct": 800.0
        },
        {
            "code": "EMP-105",
            "first_name": "David",
            "last_name": "Kim",
            "email": "david.marketing@dayflow.com",
            "phone": "+1 (555) 567-8901",
            "address": "654 Growth Ave, Palo Alto, CA",
            "dept": "Marketing",
            "desig": "Content Strategy Manager",
            "join": date(2024, 1, 8),
            "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            "basic": 7800.0, "allow": 1100.0, "deduct": 750.0
        },
        {
            "code": "EMP-106",
            "first_name": "Jessica",
            "last_name": "Taylor",
            "email": "jessica.ops@dayflow.com",
            "phone": "+1 (555) 678-9012",
            "address": "987 Logistics Park, Berkeley, CA",
            "dept": "Operations",
            "desig": "Operations Lead",
            "join": date(2023, 2, 20),
            "image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            "basic": 8200.0, "allow": 1250.0, "deduct": 850.0
        },
        {
            "code": "EMP-107",
            "first_name": "Robert",
            "last_name": "Miller",
            "email": "robert.eng@dayflow.com",
            "phone": "+1 (555) 789-0123",
            "address": "159 Developer Row, Sunnyvale, CA",
            "dept": "Engineering",
            "desig": "Backend Infrastructure Engineer",
            "join": date(2024, 4, 2),
            "image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            "basic": 9000.0, "allow": 1400.0, "deduct": 950.0
        },
        {
            "code": "EMP-108",
            "first_name": "Lisa",
            "last_name": "Anderson",
            "email": "lisa.mkt@dayflow.com",
            "phone": "+1 (555) 890-1234",
            "address": "753 Brand Way, San Mateo, CA",
            "dept": "Marketing",
            "desig": "Growth & Performance Lead",
            "join": date(2024, 2, 14),
            "image": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
            "basic": 8000.0, "allow": 1150.0, "deduct": 780.0
        },
    ]

    default_user_pass = auth.get_password_hash("User@123")
    created_employees = []

    for item in employees_data:
        usr = models.User(
            email=item["email"],
            password_hash=default_user_pass,
            role="EMPLOYEE",
            is_active=True,
        )
        db.add(usr)
        db.flush()

        emp = models.Employee(
            user_id=usr.id,
            employee_code=item["code"],
            first_name=item["first_name"],
            last_name=item["last_name"],
            full_name=f"{item['first_name']} {item['last_name']}",
            email=item["email"],
            phone=item["phone"],
            address=item["address"],
            department=item["dept"],
            designation=item["desig"],
            joining_date=item["join"],
            profile_image=item["image"],
        )
        db.add(emp)
        db.flush()

        py = models.Payroll(
            employee_id=emp.id,
            basic_salary=item["basic"],
            allowances=item["allow"],
            deductions=item["deduct"],
            net_salary=item["basic"] + item["allow"] - item["deduct"],
        )
        db.add(py)
        created_employees.append(emp)

    # Combine all employees including HR
    all_employees = [hr_employee] + created_employees

    # 3. Seed Attendance Records for past 20 business days
    today = date.today()
    for day_offset in range(20, -1, -1):
        target_date = today - timedelta(days=day_offset)
        # Skip weekends (Saturday = 5, Sunday = 6)
        if target_date.weekday() in (5, 6):
            continue

        for emp in all_employees:
            # Skip today's attendance for a couple employees so check-in can be tested
            if target_date == today and emp.employee_code in ("EMP-101", "EMP-102"):
                continue

            # Deterministic status pattern
            hash_val = (emp.id * 17 + day_offset * 13) % 100
            if hash_val < 80:
                status = "Present"
                check_in_time = datetime.combine(target_date, datetime.min.time()).replace(hour=9, minute=0)
                check_out_time = datetime.combine(target_date, datetime.min.time()).replace(hour=17, minute=30)
                hours = 8.5
            elif hash_val < 90:
                status = "Half-Day"
                check_in_time = datetime.combine(target_date, datetime.min.time()).replace(hour=9, minute=15)
                check_out_time = datetime.combine(target_date, datetime.min.time()).replace(hour=13, minute=0)
                hours = 3.75
            elif hash_val < 95:
                status = "Leave"
                check_in_time = datetime.combine(target_date, datetime.min.time()).replace(hour=9, minute=0)
                check_out_time = None
                hours = 0.0
            else:
                status = "Absent"
                check_in_time = datetime.combine(target_date, datetime.min.time()).replace(hour=9, minute=0)
                check_out_time = None
                hours = 0.0

            att = models.Attendance(
                employee_id=emp.id,
                attendance_date=target_date,
                check_in=check_in_time,
                check_out=check_out_time if status in ("Present", "Half-Day") else None,
                status=status,
                working_hours=hours,
            )
            db.add(att)

    # 4. Seed Leave Requests
    sample_leaves = [
        {
            "emp_code": "EMP-101",
            "type": "Paid Leave",
            "start": today + timedelta(days=5),
            "end": today + timedelta(days=7),
            "reason": "Family vacation planned in advance.",
            "status": "Pending",
            "comment": None,
        },
        {
            "emp_code": "EMP-102",
            "type": "Sick Leave",
            "start": today - timedelta(days=10),
            "end": today - timedelta(days=9),
            "reason": "Severe fever and flu recovery.",
            "status": "Approved",
            "comment": "Approved. Get well soon!",
        },
        {
            "emp_code": "EMP-104",
            "type": "Paid Leave",
            "start": today + timedelta(days=2),
            "end": today + timedelta(days=3),
            "reason": "Attending annual financial technology seminar.",
            "status": "Pending",
            "comment": None,
        },
        {
            "emp_code": "EMP-105",
            "type": "Unpaid Leave",
            "start": today - timedelta(days=15),
            "end": today - timedelta(days=14),
            "reason": "Personal relocation matters.",
            "status": "Approved",
            "comment": "Approved as unpaid leave.",
        },
        {
            "emp_code": "EMP-106",
            "type": "Paid Leave",
            "start": today - timedelta(days=25),
            "end": today - timedelta(days=20),
            "reason": "Urgent dental procedure.",
            "status": "Rejected",
            "comment": "High workload period in Operations. Please reschedule if possible.",
        },
        {
            "emp_code": "EMP-107",
            "type": "Sick Leave",
            "start": today + timedelta(days=1),
            "end": today + timedelta(days=2),
            "reason": "Doctor appointment and diagnostic tests.",
            "status": "Pending",
            "comment": None,
        },
    ]

    emp_map = {emp.employee_code: emp for emp in all_employees}

    for item in sample_leaves:
        if item["emp_code"] in emp_map:
            emp = emp_map[item["emp_code"]]
            lr = models.LeaveRequest(
                employee_id=emp.id,
                leave_type=item["type"],
                start_date=item["start"],
                end_date=item["end"],
                reason=item["reason"],
                status=item["status"],
                admin_comment=item["comment"],
            )
            db.add(lr)

    db.commit()
    print("Database seeding completed successfully!")
