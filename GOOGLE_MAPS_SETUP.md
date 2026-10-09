# LOOOP Google Maps Platform Integration & Setup Guide

This document provides a comprehensive end-to-end guide for configuring, deploying, and troubleshooting Google Maps Platform services within the LOOOP application.

---

## 1. Required Google Cloud APIs

Ensure the following 4 APIs are enabled in your [Google Cloud Console](https://console.cloud.google.com/apis/library):

1. **Maps JavaScript API** (Client-side map rendering, custom markers, InfoWindows)
2. **Places API** (Location autocomplete & place search)
3. **Geocoding API** (Forward & reverse geocoding of coordinates)
4. **Routes API** (Server-side route calculation, distance, duration & polyline)

---

## 2. Environment Variable Configuration

### Frontend (Vite & Vercel)
Variable Name: `VITE_GOOGLE_MAPS_API_KEY`

- **Local Development (`client/.env`)**:
  ```env
  VITE_API_URL=/api
  VITE_GOOGLE_MAPS_API_KEY=AIzaSyBe2FMpqR-D4-e2tkkAV8C38Cf5rneWoGM
  ```

- **Vercel Production (Environment Variables)**:
  - Key: `VITE_GOOGLE_MAPS_API_KEY`
  - Value: `AIzaSyBe2FMpqR-D4-e2tkkAV8C38Cf5rneWoGM`

> **Note**: Vite bakes environment variables starting with `VITE_` into the static build. After adding or updating environment variables on Vercel, trigger a **new deployment**.

### Backend (Node.js & Render)
Variable Name: `GOOGLE_MAPS_SERVER_API_KEY`

- **Local Development (`server/.env`)**:
  ```env
  PORT=5000
  GOOGLE_MAPS_SERVER_API_KEY=AIzaSyBe2FMpqR-D4-e2tkkAV8C38Cf5rneWoGM
  ```

- **Render Production (Environment Variables)**:
  - Key: `GOOGLE_MAPS_SERVER_API_KEY`
  - Value: `AIzaSyBe2FMpqR-D4-e2tkkAV8C38Cf5rneWoGM`

---

## 3. Security & API Key Restrictions

To protect your Google Cloud billing quota in production:

### Browser Key Restrictions (`VITE_GOOGLE_MAPS_API_KEY`)
- Set **Application Restrictions** to **HTTP referrers (web sites)**.
- Add your allowed domains:
  - `http://localhost:5173/*` (local dev)
  - `http://localhost:3000/*`
  - `https://*.vercel.app/*` (production domain)

### Server Key Restrictions (`GOOGLE_MAPS_SERVER_API_KEY`)
- Set **Application Restrictions** to **IP addresses** (Render backend outbound IPs).
- Set **API Restrictions** to restrict to **Routes API** & **Directions API**.

---

## 4. Architecture & System Flow

```
[CUSTOMER FRONTEND (React + Vite)]
   │
   ├──> Loads Maps SDK via googleMapsLoader.js (Singleton)
   ├──> Places Autocomplete / Location Picker (GoogleMapPicker.jsx)
   ├──> Browse Map View (GoogleBrowseMap.jsx)
   │
   └──> POST /api/maps/route
            │
            ▼
[LOOOP EXPRESS BACKEND (Node.js)]
   │
   ├──> Validates origin/destination coordinates [-90,90] [-180,180]
   ├──> Attaches GOOGLE_MAPS_SERVER_API_KEY securely
   └──> Calls Google Directions / Routes API
            │
            ▼
[GOOGLE CLOUD PLATFORM]
   │
   └──> Returns real polyline, distance & duration
```

---

## 5. Location Privacy Standard

LOOOP enforces privacy rules to protect community members:
1. **No Exact Street Addresses**: Customer home addresses are never published.
2. **500m Privacy Radius**: Pickup location zones are rendered with a 500m radius circle around approximate coordinates.
3. **Coordinate Jitter**: Coordinates stored on public items are rounded or offset by ~100-300 meters.

---

## 6. Development Diagnostics & Troubleshooting

Run in browser console during local development:
```javascript
import { runGoogleMapsDiagnostics } from './services/googleMapsDiagnostics';
runGoogleMapsDiagnostics();
```

### Common Error Codes & Resolutions

| Error Status | Cause | Resolution |
| :--- | :--- | :--- |
| `gm_authFailure` | Invalid API key or domain referrer mismatch | Check Google Cloud API key HTTP referrer settings. |
| `REQUEST_DENIED` | API not enabled or billing inactive | Enable Maps JS, Places, and Routes API in Cloud Console. |
| `ZERO_RESULTS` | No route available between points | Verify coordinates or switch travel mode (e.g. DRIVE). |
| `OVER_QUERY_LIMIT` | Quota exceeded | Check Google Cloud Billing quota limits. |
