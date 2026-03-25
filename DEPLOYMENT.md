# Railway Deployment Guide

## Prerequisites

- A [Railway](https://railway.app) account
- This repository connected to Railway
- A MySQL service provisioned in Railway

---

## 1. Provision a MySQL Service

1. Open your Railway **project dashboard**.
2. Click **New** → **Database** → **MySQL**.
3. Railway will spin up a managed MySQL instance and expose a `DATABASE_URL` variable.

---

## 2. Link the MySQL Service to the Backend

The `railway.json` in this repository uses Railway's service-reference syntax:

```json
"DATABASE_URL": {
  "reference": "mysql"
}
```

This tells Railway to automatically inject the MySQL service's connection string into the
backend's environment at deploy time.

**Make sure the service is named `mysql`** (lower-case) in your Railway project, or update
the `"reference"` value to match the actual service name.

---

## 3. Required Environment Variables

Set these in **Railway → your backend service → Variables**:

| Variable        | Example value                                    | Notes                                      |
|-----------------|--------------------------------------------------|--------------------------------------------|
| `DATABASE_URL`  | *(injected automatically via service reference)* | Provided by the linked MySQL service       |
| `JWT_SECRET`    | `a-long-random-secret`                           | **Required** – set a strong value here     |
| `PORT`          | `8080`                                           | Set automatically by `railway.json`        |
| `NODE_ENV`      | `production`                                     | Set automatically by `railway.json`        |
| `JWT_EXPIRES_IN`| `7d`                                             | Set automatically by `railway.json`        |

> ⚠️ **JWT_SECRET is not included in `railway.json`** intentionally – never commit secrets
> to source control. Set it manually in the Railway dashboard.

---

## 4. Verify the Connection

After deploying, check the Railway logs for:

```
[db] Using DATABASE_URL: mysql://<credentials>@<host>:<port>/<db>
✅ MySQL connected
🚀 TransitDB API running on port 8080
```

If you see:
```
❌ MySQL connection failed: connect ECONNREFUSED ::1:3306
```

it means `DATABASE_URL` was **not** injected.  Double-check:

1. The MySQL service exists in the same Railway project.
2. The service is named `mysql` (must match the `"reference"` value in `railway.json`).
3. The backend service was **redeployed** after the MySQL service was created.

---

## 5. Local Development

Copy `.env.example` to `.env` and fill in your local values:

```bash
cp transitdb/backend/.env.example transitdb/backend/.env
```

Set at least:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – your local MySQL credentials
- `JWT_SECRET` – any random string for local testing

Run the backend:

```bash
cd transitdb/backend
npm install
npm start
```
