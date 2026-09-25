# Hulk Fitness - Gym Management System

A clean, high-performance, and responsive web application built with **React (Frontend)**, **PHP (Backend API)**, **Bootstrap 5 (Styling)**, and **MySQL (Database)**.

---

## 🎯 System Modules & Architecture

```text
Admin Login (admin@gym.com / admin123) / Google Authentication
     │
     ▼
Hulk Fitness Command Dashboard
     ├── 1. Members Management (Add, View, Edit, Delete Athletes)
     ├── 2. Membership Plans (Create, Edit, Delete Packages)
     ├── 3. Memberships & Payments (Assign Plans, Record Payments, Track Expiry)
     └── 4. Events & Workshops (Schedule Bootcamps, Capacity Control, Member Attendance)
```

### 📊 Dashboard KPIs
- **Total Members:** Total registered members in the gym.
- **Active Members:** Members whose plan has not expired (`end_date >= today`).
- **Expired Members:** Members whose plan has ended or need renewal.
- **Total Plans:** Count of available membership packages.
- **Total Revenue:** Sum of all collected membership fees.
- **Recent Memberships Table:** Latest admission records with member details and payment mode.

---

## 🗄️ Database Structure (4 Simple Tables)

1. **`users`**
   - `id`, `name`, `email`, `password`, `created_at`
2. **`members`**
   - `id`, `name`, `email`, `phone`, `gender`, `join_date`, `status`, `created_at`
3. **`plans`**
   - `id`, `plan_name`, `duration` (in days), `price`, `created_at`
4. **`memberships`**
   - `id`, `member_id`, `plan_id`, `start_date`, `end_date`, `amount`, `payment_method`, `created_at`

---

## 🚀 Quick Setup Guide

### 1. Database (MySQL / phpMyAdmin)
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Import `database/schema.sql` into MySQL.
3. Import `database/seed.sql` to populate default admin, plans, and sample data.

### 2. Backend (PHP with WAMP)
- Ensure WAMP Apache & MySQL services are running.
- Backend API root: `http://localhost/gym-management-system/backend/`
- Database config: `backend/config/Database.php` (`host: 127.0.0.1`, `user: root`, `password: ''`, `db: gym_management`).

### 3. Frontend (React)
1. Open terminal inside `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open browser at: **`http://localhost:3000`**

### 🔑 Default Admin Login
- **Email:** `admin@gym.com`
- **Password:** `admin123`
