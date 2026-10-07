# LOOOP Backend API

> **Share. Reuse. Connect.** — RESTful API, Real-Time Messaging & Database Engine (Server Application)

The **LOOOP Backend** is a production-grade Node.js and Express application powered by MongoDB Atlas. It handles user authentication, item and wanted item discovery, requests, state-machine transactions, bilateral handovers, reviews, environmental impact analytics, community safety moderation, and authenticated WebSockets via Socket.IO.

---

## 1. Technology Stack

* **Runtime:** Node.js (v18+)
* **Web Framework:** Express.js
* **Database (Primary):** **PostgreSQL** via **Prisma ORM** / **node-postgres (`pg`)** (with legacy MongoDB support)
* **Database Schemas:** Prisma Schema (`prisma/schema.prisma`) & PostgreSQL DDL (`scripts/initPostgres.sql`)
* **Authentication:** JSON Web Tokens (JWT) + bcryptjs (10 salt rounds) + Crypto reset tokens
* **Realtime:** Socket.IO v4
* **Security:** Helmet, CORS with strict origin validation, express-rate-limit, input sanitization
* **Compression:** Gzip compression for payloads > 1KB
* **Logging:** Morgan (production combined format)
* **Deployment Target:** Render (Web Service) / Neon / Supabase / AWS RDS

---

## 2. Directory Structure

```text
server/
├── config/
│   └── db.js                # MongoDB connection pool & status reporters
├── controllers/             # Express request handlers & controller logic
│   ├── authController.js    # Registration, login, crypto password reset, logout
│   ├── itemController.js    # Items CRUD, discovery, privacy-preserving queries
│   ├── wantedController.js  # Wanted items CRUD and fulfillment
│   ├── requestController.js # Request workflow & auto transaction creation
│   ├── transactionController.js # State machine, handover, returns, completion
│   ├── conversationController.js # Chat listings, message history, read status
│   ├── notificationController.js # In-app notifications & preferences
│   ├── reviewController.js  # Participant reviews & trust rating aggregation
│   ├── impactController.js  # Environmental metrics & platform sustainability
│   ├── reportController.js  # Community safety reporting
│   └── adminController.js   # Admin dashboard, user governance, audit logging
├── middleware/
│   ├── auth.js              # Verified JWT authentication middleware
│   ├── adminMiddleware.js   # Authoritative admin role verification
│   ├── rateLimiter.js       # Brute force & request throttling middleware
│   ├── errorHandler.js      # Centralized error handler (omits stack in prod)
│   └── notFoundHandler.js   # 404 response handler
├── models/                  # Mongoose schemas with 32 compound indexes
│   ├── User.js, Item.js, WantedItem.js, Request.js, Transaction.js
│   ├── Conversation.js, Message.js, Notification.js, NotificationPreference.js
│   ├── Review.js, Report.js, Category.js, ImpactEvent.js, ImpactFactor.js, AdminAuditLog.js
├── routes/                  # Express API route modules
├── services/                # Encapsulated business logic services
│   ├── conversationService.js # Chat permissions & persistence
│   ├── notificationService.js # Deduplicated & preference-aware dispatch
│   ├── matchingService.js     # Deterministic compatibility algorithm
│   └── environmentalImpactService.js # Verifiable impact attribution
├── sockets/                 # Socket.IO gateway & authenticated room handlers
│   ├── index.js             # Socket server initialization & CORS
│   └── chatSocket.js        # Presence, room joining, typing, real-time messaging
├── tests/                   # 7 automated integration test suites (211 tests)
├── utils/                   # Formatters, JWT security configuration
├── server.js                # Server entrypoint with graceful shutdown
└── package.json             # Backend dependencies & scripts
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Required Environment Variables:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment | `production` (or `development`) |
| `PORT` | Listening port (Render automatically assigns) | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/looop?retryWrites=true&w=majority` |
| `JWT_SECRET` | Cryptographic secret for signing tokens | High-entropy 64-character hex string |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS | `https://looop-frontend.vercel.app` |

> [!IMPORTANT]
> In production (`NODE_ENV=production`), `JWT_SECRET` must be set explicitly. Fallback keys are disabled in production mode.

---

## 4. Local Development

Install dependencies and start the backend:

```bash
# From the server/ directory:
npm install
npm run dev     # Starts with nodemon live reload
# or
npm start       # Starts production server process
```

The server will listen at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

## 5. Automated Test Suites

The backend includes 211 verified integration tests:

```bash
# Master End-to-End System Test Suite (59 tests)
node tests/test_master_e2e_integration.js

# Subsystem Suites
node tests/test_performance_production.js      # 52 tests
node tests/tests_notifications_advanced.js     # 49 tests
node tests/test_environmental_impact.js        # 17 tests
node tests/test_admin_portal.js                # 13 tests
node tests/test_discovery_matching.js          # 12 tests
node tests/test_profile_review.js              # 9 tests
```

---

## 6. Render Deployment

1. **Deploy via Render Dashboard or Blueprint (`render.yaml`):**
   * Create a new **Web Service** pointing to your repository.
   * **Root Directory:** `server`
   * **Runtime:** Node
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Health Check Path:** `/api/health`
2. **Environment Variables on Render:**
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: Your MongoDB Atlas URI
   * `JWT_SECRET`: Secure generated random string
   * `CLIENT_URL`: Your Vercel frontend domain (`https://looop-frontend.vercel.app`)
3. **Graceful Shutdown:** The server automatically handles `SIGTERM` from Render during deployments, draining connections cleanly.
