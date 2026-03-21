# 🚌 TransitDB — Full-Stack Transport Management System

A complete full-stack project with **React frontend**, **Node.js/Express backend**, and a **real MySQL database** — with JWT authentication, role-based access control, full CRUD, audit logging, and live dashboard.

---

## 📁 Project Structure

```
transitdb/
├── database/
│   ├── schema.sql        ← Run this FIRST — creates all 7 tables
│   └── seed.sql          ← Run this SECOND — populates sample data
│
├── backend/              ← Node.js + Express REST API
│   ├── config/db.js      ← MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js       ← JWT verify + role guard
│   │   └── audit.js      ← Writes to audit_log table
│   ├── routes/
│   │   ├── auth.js       ← /api/auth/*
│   │   ├── crud.js       ← Generic CRUD factory
│   │   ├── resources.js  ← All 6 resource routers
│   │   └── dashboard.js  ← Stats + audit log endpoints
│   ├── server.js         ← Express entry point
│   ├── package.json
│   └── .env.example      ← Copy to .env and fill in
│
└── frontend/             ← React + Vite SPA
    ├── src/
    │   ├── api/axios.js     ← Axios + JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx   ← Sidebar + header
    │   │   ├── DataTable.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Field.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── TablePage.jsx  ← Universal CRUD page
    │   │   └── AuditPage.jsx
    │   ├── config/tables.js  ← Schema config for all tables
    │   └── App.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Step 1 — MySQL Database

1. Open MySQL Workbench or terminal
2. Run the schema file:
   ```sql
   source /path/to/transitdb/database/schema.sql
   ```
3. Run the seed file:
   ```sql
   source /path/to/transitdb/database/seed.sql
   ```

### Step 2 — Backend Setup

```bash
cd transitdb/backend

# Copy environment file
cp .env.example .env

# Edit .env with your MySQL credentials:
# DB_USER=root
# DB_PASSWORD=your_password
# JWT_SECRET=any_random_string_here

# Install dependencies
npm install

# Start development server
npm run dev
# → API running at http://localhost:5000
```

### Step 3 — Frontend Setup

```bash
cd transitdb/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → App running at http://localhost:5173
```

---

## 🔑 Demo Accounts (from seed data)

| Role     | Email                     | Password   | Access |
|----------|---------------------------|------------|--------|
| Admin    | admin@transitdb.com       | password   | Full CRUD + Delete |
| Operator | operator@transitdb.com    | password   | Create + Edit only |
| Viewer   | viewer@transitdb.com      | password   | Read only |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint           | Description |
|--------|--------------------|-------------|
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login → returns JWT |
| GET    | /api/auth/me       | Get current user (protected) |
| GET    | /api/auth/users    | List all users (admin only) |

### Resources (all protected — require Bearer token)
| Method | Endpoint              | Description |
|--------|-----------------------|-------------|
| GET    | /api/routes           | List all routes |
| GET    | /api/routes/:id       | Get single route |
| POST   | /api/routes           | Create route (operator+) |
| PUT    | /api/routes/:id       | Update route (operator+) |
| DELETE | /api/routes/:id       | Delete route (admin only) |

*(Same pattern for /api/vehicles, /api/schedules, /api/passengers, /api/bookings, /api/staff)*

### Dashboard
| Method | Endpoint                        | Description |
|--------|---------------------------------|-------------|
| GET    | /api/dashboard/stats            | All table counts + revenue |
| GET    | /api/dashboard/audit            | Full audit log |
| GET    | /api/dashboard/recent-bookings  | Latest 10 bookings |

---

## 🗄️ Database Schema

| Table       | Primary Key   | Foreign Keys |
|-------------|---------------|--------------|
| users       | user_id       | — |
| routes      | route_id      | — |
| vehicles    | vehicle_id    | — |
| schedules   | schedule_id   | route_id, vehicle_id |
| passengers  | passenger_id  | — |
| bookings    | booking_id    | passenger_id, schedule_id |
| staff       | staff_id      | vehicle_id |
| audit_log   | log_id        | user_id |

---

## ✨ Features

- **JWT Authentication** — token stored in localStorage, auto-attached to all requests
- **Role-based access** — Admin / Operator / Viewer with different permissions
- **Full CRUD** — Every table supports Create, Read, Update, Delete
- **Audit Log** — Every INSERT/UPDATE/DELETE is logged to `audit_log` with user + timestamp + JSON diff
- **Live Dashboard** — Real-time stats from MySQL, auto-refreshes every 15s
- **Search & Filter** — Client-side search across all columns
- **CSV Export** — Download any table as a CSV file
- **Responsive Sidebar** — Collapsible navigation
- **MySQL Foreign Keys** — Real relational constraints enforced at DB level

---

## 🔧 Production Build

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/ — deploy to Nginx / Vercel / Netlify

# Backend
cd backend
npm start
# Deploy to any Node.js host (Railway, Render, EC2, etc.)
```
