# LOOOP — Security Architecture & Hardening Guide

Security is a foundational tenet of the **LOOOP** platform. This document outlines the security controls, authentication safeguards, data privacy measures, and administrative protections implemented across the architecture.

---

## 1. Authentication & Identity Management

* **Password Hashing:** Passwords are never stored in plaintext. They are salted and hashed using `bcryptjs` with 10 calculation rounds before database insertion.
* **JSON Web Tokens (JWT):** Authenticated sessions utilize signed JWT tokens carrying user ID and authoritative role claims.
  * Tokens are verified server-side on every protected API call and Socket.IO handshake.
  * In production (`NODE_ENV=production`), `JWT_SECRET` must be set via environment variable. Insecure fallback strings are strictly rejected by `getJwtSecret()`.
* **Account Suspension Enforcement:** The authentication middleware immediately checks `accountStatus === 'suspended'` in the database and terminates active sessions with `HTTP 403 Forbidden`.
* **Secure Cryptographic Password Reset:**
  * Password reset tokens are generated using cryptographically secure random bytes (`crypto.randomBytes(32)`).
  * Only a SHA-256 hashed digest of the token is saved in MongoDB with a strict 1-hour expiration timestamp.
  * Reset tokens are strictly single-use: upon successful reset, `resetPasswordToken` and `resetPasswordExpires` are immediately nullified.
  * Account enumeration protection ensures that forgot-password queries always return generic success messages whether an account exists or not.

---

## 2. Role-Based Access Control (RBAC) & IDOR Defenses

* **Authoritative Server-Side RBAC:** Client-provided roles, IDs, or permission claims are never trusted. All authorization decisions are enforced by `adminMiddleware` and controller verification against MongoDB records.
* **Mass Assignment Prevention:** Attempts by users to modify their `role` or `accountStatus` via profile update endpoints (`PATCH /api/users/profile`) are stripped server-side.
* **Insecure Direct Object Reference (IDOR) Protections:**
  * **Items:** Only the verified item owner or an administrator can update, archive, or delete a listing.
  * **Requests:** Only the item owner can accept/decline; only the requester can cancel.
  * **Transactions:** Handover and return state machine transitions require verified participant authorization (`owner` or `recipient`).
  * **Conversations:** Socket.IO rooms and REST message endpoints reject non-participants with `HTTP 403`.
  * **Notifications:** Users cannot read or delete notifications belonging to other community members.

---

## 3. Network & Transport Security

* **Security Headers (Helmet):** All HTTP responses include hardened security headers:
  * `Content-Security-Policy`
  * `X-Frame-Options: DENY` (clickjacking protection)
  * `X-Content-Type-Options: nosniff` (MIME-sniffing protection)
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Cross-Origin-Resource-Policy: cross-origin`
* **CORS (Cross-Origin Resource Sharing):**
  * Configured via whitelist matching `CLIENT_URL` and authorized production domains.
  * Wildcard `*` origins are prohibited when handling credentials (`credentials: true`).
* **Reverse Proxy Trust:** Configured `app.set('trust proxy', 1)` enables accurate client IP resolution behind Cloud/Render proxies for rate limiters.

---

## 4. Rate Limiting & Throttling

* **Auth Route Rate Limiting:** Brute force attacks on `/api/auth/login` and `/api/auth/register` are limited via `express-rate-limit` (e.g. max 10 requests per 15-minute window per IP).
* **API Throttling:** General API routes are bounded to prevent denial-of-service (DoS) attacks.
* **Chat Rate Limiting:** Socket.IO messaging applies per-user sliding-window rate limiting (maximum 15 messages per 10-second window) to block spam bots.

---

## 5. Location Privacy Safeguards

LOOOP prioritizes personal safety and community privacy:
* **No Exact Private Addresses:** The system never exposes exact street addresses, building numbers, or precise coordinates in public API endpoints or frontend discovery maps.
* **Approximate Representation:** Only city, district, and generalized locality (e.g. `Indiranagar, Bengaluru`) are displayed publicly.
* **Sanitized Responses:** Both public item detail endpoints and admin listings strip exact coordinates and address lines from the serialized output.

---

## 6. Community Safety, Reporting & Moderation

* **Community Reporting:** Members can submit reports on suspicious listings, inappropriate messages, or policy violations (`POST /api/reports`). Self-reporting is blocked.
* **Administrative Audit Trails:** Every administrative moderation action (suspending a user, hiding an item, resolving a report, updating platform settings) creates an immutable record in `AdminAuditLog` tracking admin ID, target entity, timestamp, and IP address.
* **Content Sanitization:** User descriptions, review comments, and messages are stripped of executable HTML tags to eliminate Cross-Site Scripting (XSS).

---

## 7. Secrets Management

* **No Committed Secrets:** Repository `.gitignore` rules prevent `.env`, `.env.local`, and `.env.production` files from entering version control.
* **Clean Examples:** `.env.example` documents required variable names without real values.
* **Production Credentials:** Injected exclusively through hosting platform environment variables (Render Dashboard and Vercel Project Settings).
