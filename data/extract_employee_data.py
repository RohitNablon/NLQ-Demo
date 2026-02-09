import sqlite3
import json

db_path = 'd:/Codebase/NLQ/NLQ_2/NLQ_2/nlq-ui/data/employee.db'
output_path = 'd:/Codebase/NLQ/NLQ_2/NLQ_2/nlq-ui/src/mock-data/employee.json'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all employees
    cursor.execute("SELECT * FROM Employee")
    employees = cursor.fetchall()
    
    # Get all roles
    cursor.execute("SELECT * FROM ROLE")
    roles = cursor.fetchall()
    
    # Build JSON structure
    data = {
        "schema": {
            "Employee": {
                "columns": ["Id", "Email", "First_Name", "Last_Name"],
                "rowCount": len(employees)
            },
            "ROLE": {
                "columns": ["Id", "Designation", "Employee_ID"],
                "rowCount": len(roles)
            }
        },
        "data": {
            "employees": [
                {
                    "id": row[0],
                    "email": row[1],
                    "firstName": row[2],
                    "lastName": row[3]
                }
                for row in employees
            ],
            "roles": [
                {
                    "id": row[0],
                    "designation": row[1],
                    "employeeId": row[2]
                }
                for row in roles
            ]
        },
        "sampleQueries": [
            {
                "question": "How many employees do we have?",
                "sql": "SELECT COUNT(*) FROM Employee",
                "result": len(employees)
            },
            {
                "question": "List all employees and their roles",
                "sql": "SELECT e.First_Name, e.Last_Name, r.Designation FROM Employee e JOIN ROLE r ON e.Id = r.Employee_ID",
                "result": "table"
            },
            {
                "question": "Who is the CEO?",
                "sql": "SELECT e.First_Name, e.Last_Name FROM Employee e JOIN ROLE r ON e.Id = r.Employee_ID WHERE r.Designation = 'CEO'",
                "result": "Kevin Eleven"
            }
        ]
    }
    
    conn.close()
    
    # Write to JSON file
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Successfully extracted employee.db to {output_path}")
    print(f"   - {len(employees)} employees")
    print(f"   - {len(roles)} roles")
    
except Exception as e:
    print(f"❌ Error: {e}")
