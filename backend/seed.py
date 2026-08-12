"""
seed.py - Seed the database with sample employees.
Run once: python seed.py
Passwords are bcrypt-hashed before storage.
"""
from database import employees
from auth import hash_password

employee_list = [
    {
        "employee_id": "ADMIN001",
        "name": "Super Admin",
        "email": "admin@company.com",
        "password": "Admin@123",
        "department": "IT",
        "role": "Admin",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP001",
        "name": "John Doe",
        "email": "john@company.com",
        "password": "john123",
        "department": "IT",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },

    {
        "employee_id": "EMP002",
        "name": "Alice Smith",
        "email": "alice@company.com",
        "password": "alice123",
        "department": "HR",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP003",
        "name": "David Lee",
        "email": "david@company.com",
        "password": "david123",
        "department": "Finance",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP004",
        "name": "Emma Wilson",
        "email": "emma@company.com",
        "password": "emma123",
        "department": "Marketing",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP005",
        "name": "Michael Brown",
        "email": "michael@company.com",
        "password": "michael123",
        "department": "Sales",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP006",
        "name": "Sophia Davis",
        "email": "sophia@company.com",
        "password": "sophia123",
        "department": "IT",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP007",
        "name": "James Anderson",
        "email": "james@company.com",
        "password": "james123",
        "department": "Support",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP008",
        "name": "Olivia Thomas",
        "email": "olivia@company.com",
        "password": "olivia123",
        "department": "Operations",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP009",
        "name": "William Taylor",
        "email": "william@company.com",
        "password": "william123",
        "department": "Security",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    },
    {
        "employee_id": "EMP010",
        "name": "Charlotte Martin",
        "email": "charlotte@company.com",
        "password": "charlotte123",
        "department": "Management",
        "role": "Employee",
        "status": "Active",
        "failed_attempts": 0
    }
]

# Hash passwords before inserting
for emp in employee_list:
    emp["password"] = hash_password(emp["password"])

employees.delete_many({})  # Clear existing
employees.insert_many(employee_list)
print(f"{len(employee_list)} employees seeded successfully!")
print("Admin credentials: admin@company.com / Admin@123")
