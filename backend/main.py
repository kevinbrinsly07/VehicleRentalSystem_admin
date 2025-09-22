from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import traceback
from datetime import datetime, timedelta
import logging

import os
from fastapi.staticfiles import StaticFiles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models


class Car(BaseModel):
    id: Optional[int] = None
    make: str
    model: str
    year: int
    price_per_day: float
    available: bool = True


class Customer(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    id_card_url: Optional[str] = None
    driving_license_url: Optional[str] = None


class Rental(BaseModel):
    id: Optional[int] = None
    car_id: int
    customer_id: int
    start_date: str
    days: Optional[int] = None  # Number of days expected rental
    total_cost: Optional[float] = None
    deposit_amount: float = 0.0
    is_paid: bool = False
    payment_method: Optional[str] = None
    # Calculated by backend or set when returned
    end_date: Optional[str] = None


class Sale(BaseModel):
    id: Optional[int] = None
    rental_id: int
    customer_id: int
    car_id: int
    total_cost: float
    sale_date: str


class Insurance(BaseModel):
    id: Optional[int] = None
    car_id: int
    provider: str
    policy_number: str
    start_date: str
    end_date: str
    coverage: Optional[str] = None


class LegalDocument(BaseModel):
    id: Optional[int] = None
    car_id: int
    doc_type: str
    number: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    file_url: Optional[str] = None


class Maintenance(BaseModel):
    id: Optional[int] = None
    car_id: int
    maint_type: str
    due_date: str
    status: str = "pending"  # pending | completed
    cost: Optional[float] = 0.0
    notes: Optional[str] = None


class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    role: str = "staff"  # admin | manager | staff
    active: bool = True


# Database class
class Database:
    def __init__(self, db_name='car_rental.db'):
        self.conn = sqlite3.connect(db_name, check_same_thread=False)
        self.create_tables()

    def create_tables(self):
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS cars (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        make TEXT NOT NULL,
                        model TEXT NOT NULL,
                        year INTEGER NOT NULL,
                        price_per_day REAL NOT NULL,
                        available BOOLEAN NOT NULL DEFAULT 1
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS customers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE
                    )
                ''')
                # Ensure new columns exist on customers
                cursor.execute("PRAGMA table_info(customers)")
                cols = [r[1] for r in cursor.fetchall()]
                if 'id_card_url' not in cols:
                    cursor.execute("ALTER TABLE customers ADD COLUMN id_card_url TEXT")
                if 'driving_license_url' not in cols:
                    cursor.execute("ALTER TABLE customers ADD COLUMN driving_license_url TEXT")
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS rentals (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_id INTEGER NOT NULL,
                        customer_id INTEGER NOT NULL,
                        start_date TEXT NOT NULL,
                        end_date TEXT,
                        total_cost REAL,
                        deposit_amount REAL NOT NULL DEFAULT 0.0,
                        is_paid BOOLEAN NOT NULL DEFAULT 0,
                        payment_method TEXT,
                        FOREIGN KEY (car_id) REFERENCES cars(id),
                        FOREIGN KEY (customer_id) REFERENCES customers(id)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS sales (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        rental_id INTEGER NOT NULL,
                        customer_id INTEGER NOT NULL,
                        car_id INTEGER NOT NULL,
                        total_cost REAL NOT NULL,
                        sale_date TEXT NOT NULL,
                        FOREIGN KEY (rental_id) REFERENCES rentals(id),
                        FOREIGN KEY (customer_id) REFERENCES customers(id),
                        FOREIGN KEY (car_id) REFERENCES cars(id)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS insurances (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_id INTEGER NOT NULL,
                        provider TEXT NOT NULL,
                        policy_number TEXT NOT NULL,
                        start_date TEXT NOT NULL,
                        end_date TEXT NOT NULL,
                        coverage TEXT,
                        FOREIGN KEY (car_id) REFERENCES cars(id)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS legal_documents (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_id INTEGER NOT NULL,
                        doc_type TEXT NOT NULL,
                        number TEXT,
                        issue_date TEXT,
                        expiry_date TEXT,
                        file_url TEXT,
                        FOREIGN KEY (car_id) REFERENCES cars(id)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS maintenance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        car_id INTEGER NOT NULL,
                        maint_type TEXT NOT NULL,
                        due_date TEXT NOT NULL,
                        status TEXT NOT NULL DEFAULT 'pending',
                        cost REAL DEFAULT 0.0,
                        notes TEXT,
                        FOREIGN KEY (car_id) REFERENCES cars(id)
                    )
                ''')
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        role TEXT NOT NULL DEFAULT 'staff',
                        active BOOLEAN NOT NULL DEFAULT 1
                    )
                ''')
        except sqlite3.Error as e:
            logger.error(
                f"Error creating tables: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Unable to initialize database. Please try again later.")

    def add_car(self, car: Car) -> int:
        try:
            if not car.make or not car.model:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'make' and 'model' are required.")
            if car.year < 1900 or car.year > datetime.now().year + 1:
                raise HTTPException(
                    status_code=400, detail=f"Invalid input: 'year' must be between 1900 and {datetime.now().year + 1}.")
            if car.price_per_day <= 0:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'price_per_day' must be greater than 0.")
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    INSERT INTO cars (make, model, year, price_per_day, available)
                    VALUES (?, ?, ?, ?, ?)
                ''', (car.make, car.model, car.year, car.price_per_day, car.available))
                return cursor.lastrowid
        except sqlite3.Error as e:
            logger.error(
                f"Database error in add_car: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to add car due to a server error. Please try again.")

    def get_all_cars(self) -> List[Car]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT * FROM cars')
                rows = cursor.fetchall()
                return [Car(id=row[0], make=row[1], model=row[2], year=row[3], price_per_day=row[4], available=bool(row[5])) for row in rows]
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_all_cars: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve cars due to a server error. Please try again.")

    def get_car_by_id(self, car_id: int) -> Optional[Car]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT * FROM cars WHERE id = ?', (car_id,))
                row = cursor.fetchone()
                if row:
                    return Car(id=row[0], make=row[1], model=row[2], year=row[3], price_per_day=row[4], available=bool(row[5]))
                else:
                    return None
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_car_by_id: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to retrieve car with ID {car_id} due to a server error. Please try again.")

    def get_available_cars(self) -> List[Car]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT * FROM cars WHERE available = 1')
                rows = cursor.fetchall()
                return [Car(id=row[0], make=row[1], model=row[2], year=row[3], price_per_day=row[4], available=bool(row[5])) for row in rows]
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_available_cars: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve available cars due to a server error. Please try again.")

    def update_car_availability(self, car_id: int, available: bool):
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    UPDATE cars SET available = ? WHERE id = ?
                ''', (available, car_id))
        except sqlite3.Error as e:
            logger.error(
                f"Database error in update_car_availability: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update availability for car ID {car_id} due to a server error. Please try again.")

    def add_customer(self, customer: Customer) -> int:
        try:
            if not customer.name or not customer.email:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'name' and 'email' are required.")
            if "@" not in customer.email:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'email' must be a valid email address.")
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    INSERT INTO customers (name, email, id_card_url, driving_license_url)
                    VALUES (?, ?, ?, ?)
                ''', (customer.name, customer.email, customer.id_card_url, customer.driving_license_url))
                return cursor.lastrowid
        except sqlite3.IntegrityError as e:
            logger.error(
                f"Database error in add_customer: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=400, detail=f"Customer with email '{customer.email}' already exists.")
        except sqlite3.Error as e:
            logger.error(
                f"Database error in add_customer: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to add customer due to a server error. Please try again.")

    def get_all_customers(self) -> List[Customer]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT * FROM customers')
                rows = cursor.fetchall()
                return [Customer(id=row[0], name=row[1], email=row[2], id_card_url=row[3] if len(row) > 3 else None, driving_license_url=row[4] if len(row) > 4 else None) for row in rows]
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_all_customers: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve customers due to a server error. Please try again.")

    def get_customer_by_id(self, customer_id: int) -> Optional[Customer]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute(
                    'SELECT * FROM customers WHERE id = ?', (customer_id,))
                row = cursor.fetchone()
                if row:
                    return Customer(id=row[0], name=row[1], email=row[2])
                else:
                    return None
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_customer_by_id: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to retrieve customer with ID {customer_id} due to a server error. Please try again.")

    def add_rental(self, rental: Rental) -> int:
        try:
            if not rental.car_id or not rental.customer_id or not rental.start_date:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'car_id', 'customer_id', and 'start_date' are required.")
            try:
                datetime.strptime(rental.start_date, "%Y-%m-%d")
                if rental.end_date:
                    datetime.strptime(rental.end_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid date format: Use YYYY-MM-DD.")
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    INSERT INTO rentals (car_id, customer_id, start_date, end_date, total_cost, deposit_amount, is_paid, payment_method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (rental.car_id, rental.customer_id, rental.start_date, rental.end_date, rental.total_cost or 0.0,
                    rental.deposit_amount, rental.is_paid, rental.payment_method))
                return cursor.lastrowid
        except sqlite3.IntegrityError as e:
            logger.error(
                f"Database error in add_rental: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=400, detail="Invalid input: Car or customer does not exist.")
        except sqlite3.Error as e:
            logger.error(
                f"Database error in add_rental: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to create rental due to a server error. Please try again.")

    def update_rental_end(self, rental_id: int, end_date: str, total_cost: float):
        try:
            try:
                datetime.strptime(end_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid date format for 'end_date': Use YYYY-MM-DD.")
            if total_cost < 0:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'total_cost' cannot be negative.")
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    UPDATE rentals SET end_date = ?, total_cost = ? WHERE id = ?
                ''', (end_date, total_cost, rental_id))
        except sqlite3.Error as e:
            logger.error(
                f"Database error in update_rental_end: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to update rental ID {rental_id} due to a server error. Please try again.")

    def get_all_rentals(self) -> List[Rental]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT * FROM rentals')
                rows = cursor.fetchall()
                rentals = []
                for row in rows:
                    rentals.append(Rental(
                        id=row[0],
                        car_id=row[1],
                        customer_id=row[2],
                        start_date=row[3],
                        end_date=row[4],
                        total_cost=row[5],
                        deposit_amount=row[6],
                        is_paid=bool(row[7]) if row[7] is not None else False,
                        payment_method=row[8]
                    ))
                return rentals
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_all_rentals: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve rentals due to a server error. Please try again.")

    def get_rental_by_id(self, rental_id: int) -> Optional[Rental]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute(
                    'SELECT * FROM rentals WHERE id = ?', (rental_id,))
                row = cursor.fetchone()
                if row:
                    return Rental(
                        id=row[0],
                        car_id=row[1],
                        customer_id=row[2],
                        start_date=row[3],
                        end_date=row[4],
                        total_cost=row[5],
                        deposit_amount=row[6],
                        is_paid=bool(row[7]) if row[7] is not None else False,
                        payment_method=row[8]
                    )
                else:
                    return None
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_rental_by_id: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to retrieve rental with ID {rental_id} due to a server error. Please try again.")

    def get_active_rentals(self) -> List[dict]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    SELECT r.id, r.car_id, r.customer_id, r.start_date, r.end_date, r.total_cost,
                        r.deposit_amount, r.is_paid, r.payment_method,
                        c.make, c.model, c.year, c.price_per_day, c.available,
                        cu.name, cu.email
                    FROM rentals r
                    JOIN cars c ON r.car_id = c.id
                    JOIN customers cu ON r.customer_id = cu.id
                    WHERE r.end_date IS NULL OR r.end_date > ?
                ''', (datetime.now().strftime("%Y-%m-%d"),))
                rows = cursor.fetchall()
                result = []
                for row in rows:
                    result.append({
                        "id": row[0],
                        "car_id": row[1],
                        "customer_id": row[2],
                        "start_date": row[3],
                        "end_date": row[4],
                        "total_cost": row[5],
                        "deposit_amount": row[6],
                        "is_paid": bool(row[7]) if row[7] is not None else False,
                        "payment_method": row[8],
                        "car": {
                            "id": row[1],
                            "make": row[9],
                            "model": row[10],
                            "year": row[11],
                            "price_per_day": row[12],
                            "available": bool(row[13])
                        },
                        "customer": {
                            "id": row[2],
                            "name": row[14],
                            "email": row[15]
                        }
                    })
                return result
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_active_rentals: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to retrieve active rentals due to a server error. Please try again.")

    def add_sale(self, sale: Sale) -> int:
        try:
            if sale.total_cost <= 0:
                raise HTTPException(
                    status_code=400, detail="Invalid input: 'total_cost' must be greater than 0.")
            try:
                datetime.strptime(sale.sale_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid date format for 'sale_date': Use YYYY-MM-DD.")
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('''
                    INSERT INTO sales (rental_id, customer_id, car_id, total_cost, sale_date)
                    VALUES (?, ?, ?, ?, ?)
                ''', (sale.rental_id, sale.customer_id, sale.car_id, sale.total_cost, sale.sale_date))
                sale_id = cursor.lastrowid
                logger.info(
                    f"Successfully created sale with ID {sale_id} for rental {sale.rental_id}")
                return sale_id
        except sqlite3.IntegrityError as e:
            logger.error(
                f"Integrity error in add_sale for rental_id {sale.rental_id}: {str(e)}\n{traceback.format_exc()}")
            if "FOREIGN KEY constraint failed" in str(e):
                raise HTTPException(
                    status_code=400, detail=f"Invalid input: Rental ID {sale.rental_id}, Customer ID {sale.customer_id}, or Car ID {sale.car_id} does not exist.")
            raise HTTPException(
                status_code=400, detail=f"Failed to create sale due to invalid data: {str(e)}")
        except sqlite3.Error as e:
            logger.error(
                f"Database error in add_sale for rental_id {sale.rental_id}: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail="Failed to create sale due to a server error. Please try again.")

    def get_sale_by_rental_id(self, rental_id: int) -> Optional[Sale]:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute(
                    'SELECT * FROM sales WHERE rental_id = ?', (rental_id,))
                row = cursor.fetchone()
                if row:
                    return Sale(id=row[0], rental_id=row[1], customer_id=row[2], car_id=row[3], total_cost=row[4], sale_date=row[5])
                else:
                    return None
        except sqlite3.Error as e:
            logger.error(
                f"Database error in get_sale_by_rental_id for rental_id {rental_id}: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(
                status_code=500, detail=f"Failed to retrieve sale for rental ID {rental_id} due to a server error. Please try again.")

    # --- Insurance ---
    def add_insurance(self, ins: Insurance) -> int:
        try:
            for d in [ins.start_date, ins.end_date]:
                datetime.strptime(d, "%Y-%m-%d")
            with self.conn:
                c = self.conn.cursor()
                c.execute('''
                    INSERT INTO insurances (car_id, provider, policy_number, start_date, end_date, coverage)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (ins.car_id, ins.provider, ins.policy_number, ins.start_date, ins.end_date, ins.coverage))
                return c.lastrowid
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format: Use YYYY-MM-DD.")
        except sqlite3.Error as e:
            logger.error(f"Database error in add_insurance: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to add insurance.")

    def get_insurance_by_car(self, car_id: int) -> List[Insurance]:
        try:
            with self.conn:
                c = self.conn.cursor()
                c.execute('SELECT * FROM insurances WHERE car_id = ? ORDER BY end_date DESC', (car_id,))
                rows = c.fetchall()
                return [Insurance(id=r[0], car_id=r[1], provider=r[2], policy_number=r[3], start_date=r[4], end_date=r[5], coverage=r[6]) for r in rows]
        except sqlite3.Error as e:
            logger.error(f"Database error in get_insurance_by_car: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to retrieve insurance records.")

    # --- Legal Documents ---
    def add_legal_doc(self, doc: LegalDocument) -> int:
        try:
            for d in [doc.issue_date, doc.expiry_date]:
                if d:
                    datetime.strptime(d, "%Y-%m-%d")
            with self.conn:
                c = self.conn.cursor()
                c.execute('''
                    INSERT INTO legal_documents (car_id, doc_type, number, issue_date, expiry_date, file_url)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (doc.car_id, doc.doc_type, doc.number, doc.issue_date, doc.expiry_date, doc.file_url))
                return c.lastrowid
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format: Use YYYY-MM-DD.")
        except sqlite3.Error as e:
            logger.error(f"Database error in add_legal_doc: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to add legal document.")

    def get_legal_docs_by_car(self, car_id: int) -> List[LegalDocument]:
        try:
            with self.conn:
                c = self.conn.cursor()
                c.execute('SELECT * FROM legal_documents WHERE car_id = ? ORDER BY expiry_date DESC', (car_id,))
                rows = c.fetchall()
                return [LegalDocument(id=r[0], car_id=r[1], doc_type=r[2], number=r[3], issue_date=r[4], expiry_date=r[5], file_url=r[6]) for r in rows]
        except sqlite3.Error as e:
            logger.error(f"Database error in get_legal_docs_by_car: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to retrieve legal documents.")

    # --- Maintenance ---
    def add_maintenance(self, m: Maintenance) -> int:
        try:
            datetime.strptime(m.due_date, "%Y-%m-%d")
            if m.status not in ("pending", "completed"):
                raise HTTPException(status_code=400, detail="status must be 'pending' or 'completed'")
            with self.conn:
                c = self.conn.cursor()
                c.execute('''
                    INSERT INTO maintenance (car_id, maint_type, due_date, status, cost, notes)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (m.car_id, m.maint_type, m.due_date, m.status, m.cost or 0.0, m.notes))
                return c.lastrowid
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format: Use YYYY-MM-DD.")
        except sqlite3.Error as e:
            logger.error(f"Database error in add_maintenance: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to add maintenance record.")

    def get_upcoming_maintenance(self, days_ahead: int = 30) -> List[dict]:
        try:
            with self.conn:
                c = self.conn.cursor()
                today = datetime.now().strftime('%Y-%m-%d')
                limit_date = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
                c.execute('''
                    SELECT m.id, m.car_id, m.maint_type, m.due_date, m.status, m.cost, m.notes,
                           c.make, c.model, c.year
                    FROM maintenance m
                    JOIN cars c ON m.car_id = c.id
                    WHERE m.status = 'pending' AND m.due_date BETWEEN ? AND ?
                    ORDER BY m.due_date ASC
                ''', (today, limit_date))
                rows = c.fetchall()
                return [
                    {
                        'id': r[0], 'car_id': r[1], 'maint_type': r[2], 'due_date': r[3], 'status': r[4], 'cost': r[5], 'notes': r[6],
                        'car': {'make': r[7], 'model': r[8], 'year': r[9]}
                    }
                    for r in rows
                ]
        except sqlite3.Error as e:
            logger.error(f"Database error in get_upcoming_maintenance: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to retrieve upcoming maintenance.")

    # --- Users ---
    def add_user(self, u: User) -> int:
        try:
            if not u.name or not u.email:
                raise HTTPException(status_code=400, detail="name and email are required")
            with self.conn:
                c = self.conn.cursor()
                c.execute('''
                    INSERT INTO users (name, email, role, active)
                    VALUES (?, ?, ?, ?)
                ''', (u.name, u.email, u.role, int(u.active)))
                return c.lastrowid
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        except sqlite3.Error as e:
            logger.error(f"Database error in add_user: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to add user.")

    def get_users(self) -> List[User]:
        try:
            with self.conn:
                c = self.conn.cursor()
                c.execute('SELECT * FROM users ORDER BY id DESC')
                rows = c.fetchall()
                return [User(id=r[0], name=r[1], email=r[2], role=r[3], active=bool(r[4])) for r in rows]
        except sqlite3.Error as e:
            logger.error(f"Database error in get_users: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to retrieve users.")

    def check_car_availability(self, car_id: int, start_date: str, end_date: str) -> bool:
        try:
            try:
                datetime.strptime(start_date, "%Y-%m-%d")
                if end_date:
                    datetime.strptime(end_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format: Use YYYY-MM-DD.")
            with self.conn:
                cursor = self.conn.cursor()
                end_date_for_check = end_date if end_date else '9999-12-31'
                cursor.execute('''
                    SELECT * FROM rentals
                    WHERE car_id = ? AND
                    start_date <= ? AND
                    COALESCE(end_date, '9999-12-31') >= ?
                ''', (car_id, end_date_for_check, start_date))
                row = cursor.fetchone()
                return row is None
        except sqlite3.Error as e:
            logger.error(f"Database error in check_car_availability: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail=f"Failed to check availability for car ID {car_id} due to a server error. Please try again.")

    def get_stats(self) -> dict:
        try:
            with self.conn:
                cursor = self.conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM cars')
                vehicles = cursor.fetchone()[0] or 0
                cursor.execute('SELECT COUNT(*) FROM customers')
                customers = cursor.fetchone()[0] or 0
                today = datetime.now().strftime('%Y-%m-%d')
                cursor.execute('''
                    SELECT COUNT(*) FROM rentals
                    WHERE end_date IS NULL OR end_date > ?
                ''', (today,))
                rentals_active = cursor.fetchone()[0] or 0
                cursor.execute('SELECT COUNT(*) FROM sales')
                invoices = cursor.fetchone()[0] or 0
                cursor.execute('SELECT COALESCE(SUM(total_cost), 0) FROM sales')
                revenue = cursor.fetchone()[0] or 0.0
                c2 = self.conn.cursor()
                c2.execute('SELECT COUNT(*) FROM insurances WHERE end_date BETWEEN ? AND ?', (today, (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')))
                insurance_expiring = c2.fetchone()[0] or 0
                c2.execute('SELECT COUNT(*) FROM legal_documents WHERE expiry_date BETWEEN ? AND ?', (today, (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')))
                docs_expiring = c2.fetchone()[0] or 0
                c2.execute("SELECT COUNT(*) FROM maintenance WHERE status='pending' AND due_date BETWEEN ? AND ?", (today, (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')))
                maintenance_due = c2.fetchone()[0] or 0
                c2.execute('SELECT COUNT(*) FROM users WHERE active = 1')
                users_active = c2.fetchone()[0] or 0
                return {
                    'vehicles': vehicles,
                    'customers': customers,
                    'rentals_active': rentals_active,
                    'invoices': invoices,
                    'revenue': revenue,
                    'insurance_expiring': insurance_expiring,
                    'docs_expiring': docs_expiring,
                    'maintenance_due': maintenance_due,
                    'users_active': users_active,
                }
        except sqlite3.Error as e:
            logger.error(f"Database error in get_stats: {str(e)}\n{traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to compute stats due to a server error. Please try again.")

    def close(self):
        self.conn.close()


# FastAPI App
app = FastAPI()

# Ensure uploads directory exists and mount static files
os.makedirs('uploads/customers', exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()


@app.get("/cars", response_model=List[Car])
def get_cars():
    try:
        return db.get_all_cars()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /cars endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Unable to retrieve cars due to a server error. Please try again.")


@app.get("/cars/available", response_model=List[Car])
def get_available_cars():
    try:
        return db.get_available_cars()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /cars/available endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Unable to retrieve available cars due to a server error. Please try again.")


@app.post("/cars", response_model=int)
def add_car(car: Car):
    try:
        return db.add_car(car)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /cars POST endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Failed to add car due to a server error. Please try again.")


@app.get("/customers", response_model=List[Customer])
def get_customers():
    try:
        return db.get_all_customers()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /customers endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Unable to retrieve customers due to a server error. Please try again.")


@app.post("/customers", response_model=int)
def add_customer(
    name: str = Form(...),
    email: str = Form(...),
    id_card: Optional[UploadFile] = File(None),
    driving_license: Optional[UploadFile] = File(None),
):
    try:
        # Basic validation
        if not name or not email:
            raise HTTPException(status_code=400, detail="Invalid input: 'name' and 'email' are required.")
        if "@" not in email:
            raise HTTPException(status_code=400, detail="Invalid input: 'email' must be a valid email address.")

        # Save files if provided
        id_card_url = None
        dl_url = None
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")

        def _safe_filename(fname: str) -> str:
            return fname.replace("/", "_").replace("\\", "_")

        if id_card is not None and id_card.filename:
            filename = f"customers/{timestamp}_id_{_safe_filename(id_card.filename)}"
            dest_path = os.path.join("uploads", filename)
            with open(dest_path, "wb") as out:
                out.write(id_card.file.read())
            id_card_url = f"/uploads/{filename}"

        if driving_license is not None and driving_license.filename:
            filename = f"customers/{timestamp}_dl_{_safe_filename(driving_license.filename)}"
            dest_path = os.path.join("uploads", filename)
            with open(dest_path, "wb") as out:
                out.write(driving_license.file.read())
            dl_url = f"/uploads/{filename}"

        cust = Customer(name=name, email=email, id_card_url=id_card_url, driving_license_url=dl_url)
        return db.add_customer(cust)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /customers POST endpoint: {str(e)}\n{traceback.format_exc()}"
        )
        raise HTTPException(
            status_code=500, detail="Failed to add customer due to a server error. Please try again."
        )


@app.get("/rentals", response_model=List[Rental])
def get_rentals():
    try:
        return db.get_all_rentals()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /rentals endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Unable to retrieve rentals due to a server error. Please try again.")


@app.get("/rentals/active", response_model=List[dict])
def get_active_rentals():
    try:
        return db.get_active_rentals()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /rentals/active endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve active rentals due to a server error. Please try again.")


@app.post("/rentals", response_model=int)
def add_rental(rental: Rental):
    try:
        with db.conn:
            car = db.get_car_by_id(rental.car_id)
            if not car or not car.available:
                raise HTTPException(
                    status_code=400, detail=f"Car with ID {rental.car_id} is not available or does not exist.")
            if not db.get_customer_by_id(rental.customer_id):
                raise HTTPException(
                    status_code=400, detail=f"Customer with ID {rental.customer_id} not found.")
            try:
                start = datetime.strptime(rental.start_date, "%Y-%m-%d")
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid date format for 'start_date': Use YYYY-MM-DD.")
            end_date = None
            if rental.days:
                if rental.days < 1:
                    raise HTTPException(
                        status_code=400, detail="Invalid input: 'days' must be at least 1.")
                end_date = (start + timedelta(days=rental.days)
                            ).strftime("%Y-%m-%d")
                rental.total_cost = rental.days * car.price_per_day
            if not db.check_car_availability(rental.car_id, rental.start_date, end_date or '9999-12-31'):
                raise HTTPException(
                    status_code=400, detail=f"Car with ID {rental.car_id} is not available for the selected dates.")
            rental.end_date = end_date
            if not rental.total_cost:
                rental.total_cost = 0.0  # For rentals still in progress
            logger.info(
                f"Creating rental with car_id {rental.car_id}, customer_id {rental.customer_id}, start_date {rental.start_date}, end_date {rental.end_date}, days {rental.days}")
            rental_id = db.add_rental(rental)
            logger.info(f"Rental created with ID {rental_id}")
            # Mark car as unavailable when rented
            db.update_car_availability(rental.car_id, False)
            # If end_date is pre-defined (days provided), optionally create sale now or later?
            # (We’ll defer sale until return in this version)
            return rental_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /rentals POST endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail="Failed to create rental due to a server error. Please try again.")


@app.put("/rentals/{rental_id}/return", response_model=int)
def return_car(rental_id: int):
    try:
        with db.conn:
            rental = db.get_rental_by_id(rental_id)
            if not rental:
                raise HTTPException(
                    status_code=404, detail=f"Rental with ID {rental_id} not found.")

            current_date_str = datetime.now().strftime("%Y-%m-%d")

            # Decide new end_date and total_cost
            start_date_obj = None
            try:
                start_date_obj = datetime.strptime(
                    rental.start_date, "%Y-%m-%d")
            except ValueError:
                logger.error(
                    f"Invalid start_date in rental {rental_id}: {rental.start_date}")
                raise HTTPException(
                    status_code=400, detail="Invalid start_date format in the rental. Use YYYY-MM-DD.")

            # If rental already has an end_date, but it's in future, treat as early return
            # If rental has no end_date, treat as ongoing return
            end_date_obj = None
            if rental.end_date:
                try:
                    end_date_obj = datetime.strptime(
                        rental.end_date, "%Y-%m-%d")
                except ValueError:
                    logger.error(
                        f"Invalid end_date in rental {rental_id}: {rental.end_date}")
                    raise HTTPException(
                        status_code=400, detail="Invalid end_date format in the rental. Use YYYY-MM-DD.")

            # We'll compute days = difference between start_date and today (inclusive of partial day)
            today_obj = datetime.strptime(current_date_str, "%Y-%m-%d")

            # Ensure minimum 1 day if returned same day
            delta_days = (today_obj - start_date_obj).days
            if delta_days < 0:
                # This would mean start_date is in future => invalid state
                raise HTTPException(
                    status_code=400, detail="Cannot return before rental start date.")
            if delta_days == 0:
                delta_days = 1

            car = db.get_car_by_id(rental.car_id)
            if not car:
                raise HTTPException(
                    status_code=404, detail=f"Car with ID {rental.car_id} not found.")

            total_cost = delta_days * car.price_per_day

            # Update rental record
            db.update_rental_end(rental_id, current_date_str, total_cost)

            # Create or retrieve sale
            existing_sale = db.get_sale_by_rental_id(rental_id)
            if not existing_sale:
                customer = db.get_customer_by_id(rental.customer_id)
                if not customer:
                    raise HTTPException(
                        status_code=404, detail=f"Customer with ID {rental.customer_id} not found.")
                sale = Sale(
                    rental_id=rental_id,
                    customer_id=rental.customer_id,
                    car_id=rental.car_id,
                    total_cost=total_cost,
                    sale_date=current_date_str
                )
                logger.info(
                    f"Creating sale for rental {rental_id} on early/scheduled return date {current_date_str}")
                sale_id = db.add_sale(sale)
                logger.info(
                    f"Sale created with ID {sale_id} for rental {rental_id}")
            else:
                sale_id = existing_sale.id

            # Mark car as available now
            db.update_car_availability(rental.car_id, True)

            return sale_id

    except HTTPException:
        raise
    except Exception as e:
        db.conn.rollback()
        logger.error(
            f"Error in /rentals/{rental_id}/return endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process return for rental ID {rental_id} due to a server error. Please try again.")


@app.get("/rentals/{rental_id}/invoice")
def get_invoice(rental_id: int):
    try:
        rental = db.get_rental_by_id(rental_id)
        if not rental:
            raise HTTPException(
                status_code=404, detail=f"Rental with ID {rental_id} not found.")
        if not rental.end_date:
            raise HTTPException(
                status_code=400, detail=f"Rental with ID {rental_id} is not completed. Invoice cannot be generated.")
        sale = db.get_sale_by_rental_id(rental_id)
        if not sale:
            raise HTTPException(
                status_code=404, detail=f"Sale for rental ID {rental_id} not found.")
        car = db.get_car_by_id(rental.car_id)
        if not car:
            raise HTTPException(
                status_code=404, detail=f"Car with ID {rental.car_id} not found.")
        customer = db.get_customer_by_id(rental.customer_id)
        if not customer:
            raise HTTPException(
                status_code=404, detail=f"Customer with ID {rental.customer_id} not found.")
        return {
            "rental_id": rental.id,
            "sale_id": sale.id,
            "customer_name": customer.name,
            "customer_email": customer.email,
            "car_make": car.make,
            "car_model": car.model,
            "car_year": car.year,
            "start_date": rental.start_date,
            "end_date": rental.end_date,
            "total_cost": rental.total_cost or 0.0,
            "deposit_amount": rental.deposit_amount,
            "is_paid": rental.is_paid,
            "payment_method": rental.payment_method or "N/A",
            "sale_date": sale.sale_date
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in /rentals/{rental_id}/invoice endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate invoice for rental ID {rental_id} due to a server error. Please try again.")


@app.post('/cars/{car_id}/insurance', response_model=int)
def create_insurance(car_id: int, ins: Insurance):
    try:
        if car_id != ins.car_id:
            raise HTTPException(status_code=400, detail='car_id mismatch')
        if not db.get_car_by_id(car_id):
            raise HTTPException(
                status_code=404, detail=f'Car {car_id} not found')
        return db.add_insurance(ins)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in POST /cars/{car_id}/insurance: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to add insurance')


@app.get('/cars/{car_id}/insurance', response_model=List[Insurance])
def list_insurance(car_id: int):
    try:
        if not db.get_car_by_id(car_id):
            raise HTTPException(
                status_code=404, detail=f'Car {car_id} not found')
        return db.get_insurance_by_car(car_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error in GET /cars/{car_id}/insurance: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail='Failed to retrieve insurance')


# --- Legal Docs & Maintenance & Users endpoints ---

@app.post('/cars/{car_id}/legal-docs', response_model=int)
def create_legal_doc(car_id: int, doc: LegalDocument):
    try:
        if car_id != doc.car_id:
            raise HTTPException(status_code=400, detail='car_id mismatch')
        if not db.get_car_by_id(car_id):
            raise HTTPException(status_code=404, detail=f'Car {car_id} not found')
        return db.add_legal_doc(doc)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in POST /cars/{car_id}/legal-docs: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to add legal document')

@app.get('/cars/{car_id}/legal-docs', response_model=List[LegalDocument])
def list_legal_docs(car_id: int):
    try:
        if not db.get_car_by_id(car_id):
            raise HTTPException(status_code=404, detail=f'Car {car_id} not found')
        return db.get_legal_docs_by_car(car_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in GET /cars/{car_id}/legal-docs: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to retrieve legal documents')

@app.post('/maintenance', response_model=int)
def create_maintenance(m: Maintenance):
    try:
        if not db.get_car_by_id(m.car_id):
            raise HTTPException(status_code=404, detail=f'Car {m.car_id} not found')
        return db.add_maintenance(m)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in POST /maintenance: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to add maintenance record')

@app.get('/maintenance/upcoming', response_model=List[dict])
def upcoming_maintenance(days: int = Query(30, ge=1, le=365)):
    try:
        return db.get_upcoming_maintenance(days)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in GET /maintenance/upcoming: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to retrieve upcoming maintenance')

@app.post('/users', response_model=int)
def create_user(u: User):
    try:
        return db.add_user(u)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in POST /users: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to add user')

@app.get('/users', response_model=List[User])
def list_users():
    try:
        return db.get_users()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in GET /users: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail='Failed to retrieve users')

@app.get("/stats")
def get_stats():
    try:
        return db.get_stats()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /stats endpoint: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Unable to retrieve stats due to a server error. Please try again.")