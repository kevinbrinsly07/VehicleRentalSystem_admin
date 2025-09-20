import sqlite3

try:
    conn = sqlite3.connect('/Users/kevinbrinsly/AkalankaEnterprisesSystem/backend/car_rental.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(customers)")
    columns = cursor.fetchall()
    print("Customers table schema:", columns)
    cursor.execute('SELECT * FROM customers')
    rows = cursor.fetchall()
    print("Customers data:", rows)
    conn.close()
except sqlite3.Error as e:
    print(f"Database error: {str(e)}")