# LOOOP Frontend

> **Share. Reuse. Connect.** — Community Unused Products Sharing Platform (Client Application)

The **LOOOP Frontend** is a modern Single Page Application (SPA) built with **React 18**, **Vite**, **Tailwind CSS**, and custom CSS design tokens. It connects to the LOOOP backend via Axios REST clients and Socket.IO for real-time messaging and notifications.

---

## 1. Technology Stack

* **Framework:** React 18 SPA
* **Build Tool:** Vite 8.3
* **Routing:** React Router v6 (SPA dynamic client-side routing with lazy-loaded route chunks)
* **Styling:** Tailwind CSS + Vanilla CSS Tokens (responsive dark/light adaptive, glassmorphism, micro-animations)
* **Realtime:** Socket.IO Client v4
* **3D Visuals:** Three.js Interactive 3D Earth Globe
* **Maps:** Leaflet & React Leaflet (approximate location visualization without exposing private addresses)
* **Icons:** Lucide React
* **Deployment Target:** Vercel

---

## 2. Directory Structure

```text
client/
├── public/                  # Favicons, robots.txt, static assets
├── src/
│   ├── assets/              # Static media and brand illustrations
│   ├── components/          # Reusable UI components
│   │   ├── 3d/              # Three.js 3D Earth Canvas
│   │   ├── common/          # Buttons, Modals, Cards, Inputs, Badges, RatingStars
│   │   ├── browse/          # Search, filters, map toggle, pagination
│   │   ├── dashboard/       # Impact statistics, activity feeds, trust card
│   │   └── layout/          # Navbar, Footer, Navigation drawers
│   ├── context/             # Global state (AuthContext, ToastContext)
│   ├── hooks/               # Custom hooks (useDebounce, useToast)
│   ├── layouts/             # PublicLayout, CustomerLayout, AdminLayout
│   ├── pages/
│   │   ├── public/          # LandingPage, BrowsePage, ItemDetailPage, AboutPage
│   │   ├── customer/        # CustomerDashboard, ShareItem, Wanted, Messages, Impact
│   │   └── admin/           # AdminDashboard, Users, Items, Reports, Audit Logs
│   ├── routes/              # AppRoutes.jsx (Protected & Admin Route Guards)
│   ├── services/            # Centralized API service layer (api.js, socketService.js)
│   ├── styles/              # Global CSS & Tailwind configuration (index.css)
│   ├── App.jsx              # Application root with providers
│   └── main.jsx             # React DOM entrypoint
├── index.html               # Main HTML entrypoint
├── vercel.json              # Vercel SPA routing rewrite rules
├── vite.config.js           # Vite configuration & Rollup chunk optimization
└── package.json             # Frontend dependencies & scripts
```

---

## 3. Environment Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Required Variables:

| Variable | Description | Local Value | Production (Vercel) |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base REST API endpoint | `/api` (uses Vite proxy) | `https://<backend-render-app>.onrender.com/api` |
| `VITE_SOCKET_URL` | Real-time Socket.IO endpoint | `http://localhost:5000` | `https://<backend-render-app>.onrender.com` |

---

## 4. Local Development

Install dependencies and start the Vite development server:

```bash
# From the client/ directory:
npm install
npm run dev
```

The application will be accessible at: `http://localhost:3000`

---

## 5. Production Build

To test and build the production bundle:

```bash
npm run build
```

This compiles optimized bundles in `dist/` with chunking for Leaflet, Three.js, Lucide icons, and React core modules.

To preview the built production application locally:

```bash
npm run preview
```

---

## 6. Vercel Deployment

1. **Import Project into Vercel:**
   * Set **Root Directory** to `client` (or use the root repository with the provided root `vercel.json`).
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
2. **Environment Variables:**
   * `VITE_API_URL`: Set to your Render backend API URL (e.g. `https://looop-backend.onrender.com/api`).
   * `VITE_SOCKET_URL`: Set to your Render backend WebSocket URL (e.g. `https://looop-backend.onrender.com`).
3. **Deploy:** Vercel automatically deploys with SPA fallback handling through `vercel.json`.
