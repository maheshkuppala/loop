# LOOOP — REST API Specification & Endpoint Reference

Base API Path: `/api`  
Authentication: Bearer Token (`Authorization: Bearer <jwt_token>`)

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer user (validates email, name, password >= 6 chars). |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password; returns JWT and user profile. |
| `POST` | `/api/auth/forgot-password` | Public | Request secure 32-byte crypto password reset token (enumeration protected). |
| `POST` | `/api/auth/reset-password` | Public | Reset password using valid single-use token. |
| `POST` | `/api/auth/logout` | Customer | Clears session cookie/tokens. |

---

## 2. Users & Profiles (`/api/users`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Customer | Retrieve authenticated user's full private profile and completion score. |
| `PATCH` | `/api/users/profile` | Customer | Update name, bio, location, avatar, interests (role modification blocked). |
| `GET` | `/api/users/:id/public` | Public | Retrieve public user profile (name, avatar, trust score, rating, impact stats). |

---

## 3. Items & Discovery (`/api/items`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/items/discover` | Public | Browse and search items with bounded pagination, category, condition, sharing type, and location filters. |
| `GET` | `/api/items/:id` | Public | Retrieve single item details with privacy-sanitized location. |
| `POST` | `/api/items` | Customer | Publish a new item listing with images, category, and sharing type. |
| `PUT` | `/api/items/:id` | Owner | Update item listing details. |
| `DELETE` | `/api/items/:id` | Owner | Soft-delete / remove item listing. |
| `GET` | `/api/items/:id/matches` | Owner | Find matching wanted requests for this item. |

---

## 4. Wanted Items (`/api/wanted`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wanted` | Public | Browse community wanted requests with search, category, and urgency filters. |
| `GET` | `/api/wanted/:id` | Public | Retrieve single wanted item details. |
| `POST` | `/api/wanted` | Customer | Post a new wanted request (`low`, `medium`, or `high` urgency). |
| `PUT` | `/api/wanted/:id` | Owner | Edit wanted request. |
| `PATCH` | `/api/wanted/:id/close` | Owner | Close or mark wanted request as fulfilled. |
| `GET` | `/api/wanted/:id/matches` | Owner | Find matching available items in community. |

---

## 5. Requests Workflow (`/api/requests`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Customer | Submit a request to share/borrow an item (duplicate requests prevented). |
| `GET` | `/api/requests/my` | Customer | Get all incoming and outgoing requests for authenticated user. |
| `GET` | `/api/requests/:id` | Participant | Get request details, item summary, and active status. |
| `PATCH` | `/api/requests/:id/accept` | Owner | Accept request; atomically creates Transaction and reserves item. |
| `PATCH` | `/api/requests/:id/decline` | Owner | Decline request. |
| `PATCH` | `/api/requests/:id/cancel` | Requester | Cancel pending request. |

---

## 6. Transactions & State Machine (`/api/transactions`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Customer | Retrieve user's active and completed transactions. |
| `GET` | `/api/transactions/:id` | Participant | Get transaction state, handover details, and review eligibility. |
| `PATCH` | `/api/transactions/:id/handover` | Participant | Schedule handover date, time, and location. |
| `PATCH` | `/api/transactions/:id/handover/confirm` | Participant | Confirm item handover (both participants must confirm). |
| `PATCH` | `/api/transactions/:id/return/start` | Borrower | Initiate return for borrow transaction. |
| `PATCH` | `/api/transactions/:id/return/confirm` | Owner | Confirm item return (completes transaction & restores availability). |
| `PATCH` | `/api/transactions/:id/cancel` | Participant | Cancel transaction before handover occurs. |

---

## 7. Real-Time Chat & Messages (`/api/messages` & `/api/conversations`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Customer | List all active conversations with unread message badges. |
| `GET` | `/api/conversations/:id/messages` | Participant | Paginated message history for a conversation. |
| `POST` | `/api/conversations/:id/messages` | Participant | Send a chat message (persisted in MongoDB, notifies room via Socket.IO). |
| `PATCH` | `/api/conversations/:id/read` | Participant | Mark all messages in conversation as read. |

---

## 8. Notifications & Preferences (`/api/notifications`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Customer | Get paginated notifications feed with category filter. |
| `GET` | `/api/notifications/unread-count` | Customer | Get authoritative badge unread count. |
| `PATCH` | `/api/notifications/:id/read` | Customer | Mark single notification as read. |
| `PATCH` | `/api/notifications/read-all` | Customer | Mark all user notifications as read. |
| `DELETE` | `/api/notifications/:id` | Customer | Dismiss notification (security alerts protected). |
| `GET` | `/api/notifications/preferences` | Customer | Retrieve user's category & quiet hours preferences. |
| `PATCH` | `/api/notifications/preferences` | Customer | Update category toggles and quiet hours schedule. |

---

## 9. Reviews & Trust Ratings (`/api/reviews`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | Participant | Submit 1–5 star rating & comment for completed transaction (self-review prevented). |
| `GET` | `/api/reviews/user/:id` | Public | Get public review history and rating breakdown for a member. |

---

## 10. Community Safety & Reports (`/api/reports`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports` | Customer | File safety/moderation report for user or item (self-report blocked). |

---

## 11. Categories Management (`/api/categories`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | Retrieve active categories and subcategories (cached). |

---

## 12. Environmental Sustainability Impact (`/api/impact`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/impact/summary` | Public | Get platform-wide aggregated reuses, CO2e avoided, and waste diverted. |
| `GET` | `/api/impact/my` | Customer | Get authenticated user's personal sustainability score & earned milestones. |
| `GET` | `/api/impact/history` | Customer | Paginated impact events for completed user handovers. |

---

## 13. Admin Portal Governance (`/api/admin`)

*All admin endpoints require verified `role: 'admin'` or `'super_admin'` via `adminMiddleware`.*

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | Aggregate dashboard counts (users, items, transactions, reports). |
| `GET` | `/api/admin/analytics` | Admin | Real-time platform trends & category circulation metrics. |
| `GET` | `/api/admin/users` | Admin | Paginated user governance directory with search & status filters. |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Suspend or reactivate user accounts (logged to audit trail). |
| `GET` | `/api/admin/items` | Admin | Moderate listings catalog with search & status filters. |
| `PATCH` | `/api/admin/items/:id/moderation`| Admin | Hide, restore, or remove items. |
| `GET` | `/api/admin/reports` | Admin | Moderation report queue. |
| `PATCH` | `/api/admin/reports/:id/resolve` | Admin | Resolve or dismiss report with notes (logged to audit trail). |
| `GET` | `/api/admin/audit-logs` | Admin | Comprehensive immutable administrative security audit trail. |
| `GET` | `/api/admin/settings` | Admin | View platform settings & policies. |
| `PUT` | `/api/admin/settings` | Admin | Update platform configuration. |
