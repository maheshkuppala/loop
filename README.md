# LOOOP — Share. Reuse. Connect.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.IO-blue.svg)]()
[![Tests](https://img.shields.io/badge/Tests-211%20Passed%20(100%25)-brightgreen.svg)](TESTING.md)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black.svg)](DEPLOYMENT.md)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7.svg)](DEPLOYMENT.md)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](DEPLOYMENT.md)

**LOOOP** is a full-stack MERN community platform designed to facilitate sharing, lending, borrowing, exchanging, giving away, and discovering unused products. Built with sustainable circular economy principles, real-time messaging, deterministic matching, and verifiable environmental impact attribution.

```text
Own → Don't Need → Share → Someone Needs It → Reuse → Keep It in the Loop
```

---

## 1. Production Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    LOOOP ARCHITECTURE                       │
│                                                             │
│   Frontend (React 18 + Vite) ──────► Vercel (Global Edge)   │
│              │                                              │
│              ▼ HTTPS / WSS                                  │
│                                                             │
│   Backend (Express + Sockets) ─────► Render (Web Service)   │
│              │                                              │
│              ▼ TCP / TLS Mongoose                           │
│                                                             │
│   Database (MongoDB Mongoose) ─────► MongoDB Atlas (Cloud)  │
└─────────────────────────────────────────────────────────────┘
```

* **Frontend:** React 18, Vite 8.3, Tailwind CSS + Vanilla CSS Tokens, Lucide Icons, Leaflet Maps, Three.js 3D Earth.
* **Backend:** Node.js, Express, Socket.IO v4, Helmet, Compression, Rate Limiter.
* **Database:** **PostgreSQL** (via Prisma ORM & pg pool) with full relational DDL; optional legacy MongoDB Atlas support.
* **Authentication:** JWT + bcryptjs (10 rounds) + Cryptographic single-use reset tokens.
* **Deployment Targets:** Vercel (Frontend) | Render (Backend) | PostgreSQL (Render Postgres / Neon / Supabase / AWS RDS).

---

## 2. Key Platform Features

1. **Item Sharing & Discovery:** Publish, browse, filter, and search items across categories (`free`, `give_away`, `borrow`, `exchange`). Approximate neighborhood privacy mapping.
2. **Community Wanted Requests:** Members request items they need with urgency ratings (`low`, `medium`, `high`) and sharing preferences.
3. **Deterministic Matching Engine:** Multi-factor scoring algorithm matching available listings to wanted requests based on category, keywords, condition rank, and geographic distance (Haversine formula).
4. **State Machine Transactions:** Multi-step transactional state machine (`PENDING_HANDOVER` ➔ `HANDOVER_SCHEDULED` ➔ `ACTIVE` / `RETURN_PENDING` ➔ `COMPLETED`).
5. **Real-Time Messaging:** Socket.IO authenticated chat rooms with presence indicators, typing status, and message persistence.
6. **Preference-Aware Notifications:** Real-time push alerts, category filtering, quiet hours suppression, and security overrides.
7. **Verifiable Environmental Impact:** Real-time attribution of reuses, CO2e avoided, and waste diverted from verified completed transactions (zero fabrication).
8. **Trust, Ratings & Safety:** Bilateral reviews, community violation reporting, and server-enforced self-review prevention.
9. **Admin Portal & Governance:** User governance, listings catalog moderation, dispute resolution, platform settings, and immutable audit logs (`AdminAuditLog`).

---

## 3. Project Directory Structure

```text
unused-products-sharing-app/
├── client/                  # Frontend Single Page Application (React + Vite)
│   ├── src/
│   │   ├── components/      # UI components (common, browse, dashboard, layout, 3d)
│   │   ├── pages/           # Public, customer, and admin portal views
│   │   ├── services/        # Centralized Axios API & Socket.IO service layer
│   │   ├── context/         # AuthContext & ToastContext
│   │   └── styles/          # Tailwind & CSS design system tokens
│   ├── vercel.json          # Vercel SPA routing configuration
│   ├── vite.config.js       # Vite build & Rollup chunking rules
│   └── package.json
│
├── server/                  # Backend REST API & Real-Time Engine (Node + Express)
│   ├── config/              # MongoDB connection pool & status
│   ├── controllers/         # Request controllers (auth, items, requests, tx, chat, etc.)
│   ├── middleware/          # auth, adminMiddleware, rateLimiter, errorHandler
│   ├── models/              # Mongoose schemas with 32 compound indexes
│   ├── routes/              # Express API routers
│   ├── services/            # Matching, notifications, impact, conversation logic
│   ├── sockets/             # Socket.IO gateway & authenticated chat handler
│   ├── tests/               # 7 automated integration test suites (211 tests)
│   └── package.json
│
├── render.yaml              # Render Blueprint deployment definition
├── vercel.json              # Root Vercel SPA deployment configuration
├── TESTING.md               # 211 verified automated tests documentation
├── DEPLOYMENT.md            # Step-by-step production deployment guide
├── SECURITY.md              # Defense-in-depth security architecture
├── API.md                   # Complete REST API specification
└── PRODUCTION_CHECKLIST.md  # Production launch verification checklist
```

---

## 4. Quick Start (Local Development)

### Prerequisites:
* Node.js v18+
* MongoDB running locally (`mongodb://127.0.0.1:27017/looop`) or MongoDB Atlas URI

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
npm run install:all
```

### 2. Configure Environment Files
In `server/`:
```bash
cp server/.env.example server/.env
```
Ensure `server/.env` contains:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/looop
JWT_SECRET=looop_jwt_dev_secret_key_2026
CLIENT_URL=http://localhost:3000
```

In `client/`:
```bash
cp client/.env.example client/.env
```
Ensure `client/.env` contains:
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Development Servers Concurrently
```bash
npm run dev
```
* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000/api`
* **Health Check:** `http://localhost:5000/api/health`

---

## 5. Automated Testing & Verification

The platform has been audited with **211 automated integration tests** passing with a 100% success rate:

```bash
# Run Master End-to-End System Test Suite (59 tests)
node server/tests/test_master_e2e_integration.js

# Run Subsystem Integration Suites
node server/tests/test_performance_production.js      # 52 tests
node server/tests/test_notifications_advanced.js     # 49 tests
node server/tests/test_environmental_impact.js        # 17 tests
node server/tests/test_admin_portal.js                # 13 tests
node server/tests/test_discovery_matching.js          # 12 tests
node server/tests/test_profile_review.js              # 9 tests

# Run Frontend Production Build
npm run build:client
```

For complete test results and methodology, see [`TESTING.md`](TESTING.md).

---

## 6. Production Deployment Guides

* **Deployment Manual:** Detailed instructions for Render, Vercel, and Atlas in [`DEPLOYMENT.md`](DEPLOYMENT.md).
* **Security Controls:** Defense-in-depth security and privacy protections in [`SECURITY.md`](SECURITY.md).
* **API Reference:** Detailed REST API routes, schemas, and parameters in [`API.md`](API.md).
* **Production Checklist:** Verified production launch readiness checklist in [`PRODUCTION_CHECKLIST.md`](PRODUCTION_CHECKLIST.md).
