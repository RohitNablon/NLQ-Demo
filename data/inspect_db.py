import sqlite3
import sys

db_path = 'd:/Codebase/NLQ/NLQ_2/NLQ_2/nlq-ui/data/employee.db'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    print("=== DATABASE STRUCTURE ===")
    print(f"Database: {db_path}")
    print(f"Tables found: {len(tables)}\n")
    
    for table in tables:
        table_name = table[0]
        print(f"\n--- Table: {table_name} ---")
        
        # Get schema
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("Columns:")
        for col in columns:
            print(f"  - {col[1]} ({col[2]})")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"Row count: {count}")
        
        # Get sample data (first 3 rows)
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            samples = cursor.fetchall()
            print("Sample data (first 3 rows):")
            for i, row in enumerate(samples, 1):
                print(f"  Row {i}: {row}")
    
    conn.close()
    print("\n=== INSPECTION COMPLETE ===")
    
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
