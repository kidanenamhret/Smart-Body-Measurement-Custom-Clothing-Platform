# SEWFIT – Smart Custom Clothing Platform

SEWFIT is a smart, end-to-end custom-clothing platform connecting **Customers**, **Tailors**, **Delivery Agents**, and **Administrators**.

---

## 🚀 Key Features & Architecture

### 1. Multi-Role Authorization & Security
- **Role-Based Access Control (RBAC)** enforcing 4 distinct roles:
  - `CUSTOMER` – Account, profiles, measurement versioning, catalog, orders, support.
  - `TAILOR` – Business profile, verification, product catalog, order acceptance, production stages, quality check.
  - `DELIVERY_AGENT` – Job board, pickup & delivery navigation, status confirmation, proof of delivery.
  - `ADMIN` – Platform KPIs, user suspension, tailor verification/rejection, tickets, audit logs, system settings.

### 2. Extensible Body Measurement Engine & Versioning
- **20+ Anatomical Metrics**: Basic (`height`, `weight`, `bodyShape`), Upper Body (`neck`, `chest`, `shoulder`, `waist`, `armLength`, etc.), Lower Body (`hip`, `thigh`, `inseam`, `outseam`, etc.).
- **Unit Standardization**: Automatic normalization to **centimeters (`cm`)** for length and `kg` for weight. Converts inches to cm seamlessly (`1 in = 2.54 cm`).
- **Multi-Profile Version History**: Non-destructive profile updates (`Profile v1`, `Profile v2`, `Profile v3`...). Past version history is preserved.
- **Immutable Order Snapshots**: Every order locks a frozen measurement snapshot at checkout. Future profile changes **never** alter historical orders.

### 3. Tailor Platform & Strict Privacy Isolation
- **Strict Privacy Guarantee**: Tailors have **no query access** to arbitrary customer measurement profiles. Tailors can ONLY view the `measurementSnapshot` embedded in orders placed specifically with them (`order.tailorId === tailor._id`).
- **Production Lifecycle**: `ACCEPTED` ➔ `MEASUREMENTS_VERIFIED` ➔ `IN_PRODUCTION` (`CUTTING`, `SEWING`, `FITTING`) ➔ `QUALITY_CHECK` ➔ `READY_FOR_DELIVERY`.

### 4. Delivery Agent Dispatch & Confirmation
- Job pool for available orders ready for pickup.
- Pickup navigation (tailor workshop details) & delivery navigation (customer address & instructions).
- Handover confirmation with proof of delivery (recipient name, notes, photos).

### 5. Admin Governance & Platform Operations
- Dashboard with live platform metrics, revenue tracking, and reports.
- Tailor verification & rejection workflow with document inspection.
- Ticket management for customer/tailor complaints and disputes.
- Immutable security **Audit Log** capturing administrative actions with IP recording.

---

## 🛠️ API Reference Summary

| Domain | Base Path | Key Endpoints | Description |
|---|---|---|---|
| **Authentication** | `/auth` | `POST /register`, `POST /login`, `GET /verify/:token` | JWT auth & user registration |
| **Measurements** | `/api/measurements` | `GET /schema`, `POST /profiles`, `PUT /profiles/:id`, `POST /profiles/:id/snapshot` | Anatomical registry & versioning |
| **Tailor Operations** | `/api/tailor` | `POST /profile`, `POST /products`, `GET /orders`, `PATCH /orders/:id/production-status`, `POST /orders/:id/quality-check` | Tailor workshop & order execution |
| **Delivery Fleet** | `/api/delivery` | `GET /jobs/available`, `POST /jobs/:id/accept`, `POST /jobs/:id/confirm-pickup`, `POST /jobs/:id/confirm-delivery` | Delivery job tracking |
| **Admin Operations** | `/api/admin` | `GET /dashboard`, `POST /tailors/:id/verify`, `GET /tickets`, `GET /audit-logs`, `PUT /settings/:key` | Governance & platform administration |

---

## 💻 Quick Start

### 1. Backend Setup (Node.js & MongoDB)

```powershell
cd backend

# Install dependencies
npm install

# Create .env file if missing
# backend/.env:
# PORT=3001
# MONGODB_URI=mongodb://localhost:27017/sewfit
# JWT_SECRET=sewfit_super_secret_jwt_key_2026

# Build TypeScript
npm run build

# Start development server
npm run dev
```
The API server will run at **http://localhost:3001**.

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

---

## 📄 License
MIT © SEWFIT Platform Team
