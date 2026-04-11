# PingWatch — Uptime Monitoring System

A production-ready uptime monitoring system built with **React + Vite**, **Node.js + Express**, and **MongoDB**. Periodically pings your URLs, records uptime status and latency, and displays results in a premium dark-mode dashboard.

![PingWatch](https://img.shields.io/badge/PingWatch-v1.0-6366f1?style=for-the-badge&logo=statuspal&logoColor=white)

---

## 🏗 Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  Frontend (Vite)    │────▶│  Backend (Express)   │────▶│  MongoDB Atlas   │
│  React SPA          │     │  REST API + Scheduler│     │  (Mongoose)      │
│  Deployed: Vercel   │     │  Deployed: Render    │     │                  │
└─────────────────────┘     └──────────┬───────────┘     └──────────────────┘
                                       │
                            ┌──────────▼───────────┐
                            │  External Cron        │
                            │  (cron-job.org)       │
                            │  POST /api/ping-all   │
                            │  every 10 minutes     │
                            └───────────────────────┘
```

### Why This Architecture?

| Decision | Reason |
|----------|--------|
| **External cron trigger** | Render free tier puts services to sleep after 15 min of inactivity. Internal `setInterval` / `node-cron` stops when the service sleeps. An external HTTP call wakes the server AND triggers the ping cycle. |
| **Vercel for frontend only** | Vercel is serverless — it spins up functions per-request with a 10s timeout. You cannot run persistent background jobs (schedulers, cron, WebSockets) on Vercel. |
| **Render for backend** | Render supports long-running processes (Web Services) that can maintain schedulers. Free tier sleeps after inactivity, hence the external cron. |
| **`POST /api/ping-all` endpoint** | The core design decision — decouples the ping cycle from any specific runtime. Can be triggered by cron-job.org, UptimeRobot, GitHub Actions, or a simple `curl` command. |

---

## 📁 Folder Structure

```
pingwatch/
├── index.html                  # Vite HTML entry
├── vite.config.js              # Vite config with dev proxy
├── package.json                # Unified package.json
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for env vars
├── vercel.json                 # Vercel deployment config
│
├── server/                     # ─── Backend ───
│   ├── server.js               # Entry point (starts Express + scheduler)
│   ├── app.js                  # Express app (middleware, routes, error handler)
│   ├── config/
│   │   └── db.js               # MongoDB connection helper
│   ├── models/
│   │   ├── Url.js              # URL monitor schema
│   │   └── PingHistory.js      # Per-check history schema (TTL: 30 days)
│   ├── controllers/
│   │   ├── urlController.js    # CRUD for URLs + history
│   │   └── pingController.js   # Ping-all trigger handler
│   ├── routes/
│   │   ├── urlRoutes.js        # /api/url routes
│   │   └── pingRoutes.js       # /api/ping-all route
│   ├── services/
│   │   └── pingService.js      # Ping logic with 3x retry
│   └── scheduler/
│       └── pingScheduler.js    # node-cron fallback scheduler
│
└── src/                        # ─── Frontend ───
    ├── main.jsx                # React entry
    ├── App.jsx                 # Root component
    ├── App.css                 # Component styles
    ├── index.css               # Global design system
    ├── config/
    │   └── api.js              # API base URL config
    └── components/
        ├── AddUrl.jsx          # URL input form
        ├── UrlCard.jsx         # URL status card (sparkline + uptime %)
        └── UrlList.jsx         # URL list with stats bar
```

---

## 🚀 Features

### MVP (Implemented)
- ✅ Add URL to monitor (with validation)
- ✅ Delete URL (cascading history cleanup)
- ✅ List all monitored URLs
- ✅ Periodic pinging every 10 minutes
- ✅ Status tracking: UP / DOWN / PENDING
- ✅ Response time measurement (ms)
- ✅ Last checked timestamp (relative time display)
- ✅ `POST /api/ping-all` — external cron trigger

### Advanced (Implemented)
- ✅ **3x retry** on failed requests before marking DOWN
- ✅ **Uptime percentage** calculation (per URL)
- ✅ **Ping history** logging with 30-day auto-expiry (MongoDB TTL)
- ✅ **Mini sparkline** visualization (last 24 pings)
- ✅ **Auto-refresh** every 20 seconds
- ✅ **Premium dark UI** with animations, glassmorphism, grid overlay

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/url` | Add a URL to monitor |
| `GET` | `/api/url` | List all monitored URLs |
| `DELETE` | `/api/url/:id` | Remove a monitored URL |
| `GET` | `/api/url/:id/history` | Get ping history (query: `?limit=50`) |
| `POST` | `/api/ping-all` | Trigger a full ping cycle (for cron) |
| `GET` | `/api/health` | Health check with DB status |

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/<db>
PORT=5000
CORS_ORIGIN=https://your-frontend.vercel.app   # Optional, defaults to *
```

### Frontend (`.env.local` or Vercel dashboard)
```env
VITE_API_URL=https://your-backend.onrender.com  # Required in production
```

> In development, the Vite proxy in `vite.config.js` routes `/api/*` to `localhost:5000`, so `VITE_API_URL` is not needed locally.

---

## 🛠 Setup Instructions

### Prerequisites
- **Node.js** 18+
- **pnpm** (`npm install -g pnpm`)
- **MongoDB Atlas** cluster (free tier works)

### Install & Run Locally

```bash
# 1. Clone
git clone <repo-url> && cd pingwatch

# 2. Install deps
pnpm install

# 3. Configure env
cp .env.example .env
# Edit .env with your MongoDB URI

# 4. Run (starts both frontend + backend)
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health: http://localhost:5000/api/health

### Manual Ping Trigger
```bash
curl -X POST http://localhost:5000/api/ping-all
```

---

## 🚢 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Set build settings:
   - **Framework**: Vite
   - **Build command**: `pnpm build`
   - **Output directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Deploy

### Backend → Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Configure:
   - **Build command**: `pnpm install`
   - **Start command**: `node server/server.js`
   - **Environment**: Node
4. Add environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `PORT` = `10000` (Render's default)
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app`
5. Deploy

### External Cron → cron-job.org (FREE)

This is the **most critical** deployment step. Without it, pinging stops when Render sleeps.

1. Go to [cron-job.org](https://cron-job.org) and create a free account
2. Create a new cron job:
   - **URL**: `https://your-backend.onrender.com/api/ping-all`
   - **Method**: `POST`
   - **Schedule**: Every 10 minutes (`*/10 * * * *`)
   - **Timeout**: 30 seconds
3. Enable the job

This does two things:
- **Wakes** Render if it's sleeping
- **Triggers** the ping cycle immediately

---

## 📊 How Pinging Works

```
External Cron (every 10 min)
    │
    ▼
POST /api/ping-all
    │
    ▼
runPingCycle()
    │
    ├── Fetch all URLs from MongoDB
    ├── For each URL (in parallel via Promise.all):
    │   ├── HTTP GET with 5s timeout
    │   ├── On failure: retry up to 3 times (1s delay between)
    │   ├── Update URL document (status, responseTime, uptimePercent)
    │   └── Log to PingHistory collection
    │
    └── Return summary { total, up, down, duration }
```

### Retry Logic
- Attempt 1 fails → wait 1s → Attempt 2
- Attempt 2 fails → wait 1s → Attempt 3
- Attempt 3 fails → mark URL as **DOWN**
- Any attempt succeeds → mark URL as **UP**, stop retrying

### Uptime Percentage
```
uptimePercent = (successfulChecks / totalChecks) × 100
```
- Tracked per-URL using atomic counters
- Updated on every ping cycle
- Displayed in the frontend with a color-coded progress bar:
  - ≥95% → green
  - ≥80% → yellow
  - <80% → red

---

## 🔧 Error Handling

| Scenario | Behavior |
|----------|----------|
| Single URL fails to ping | Retries 3x, then marks DOWN. Other URLs unaffected. |
| MongoDB disconnects | Auto-reconnect on next request via middleware. |
| Invalid URL submitted | 400 response with validation message. |
| Duplicate URL submitted | 409 response. |
| URL not found on delete | 404 response. |
| Unhandled server error | Global error handler returns 500, logs to console. |
| History logging fails | Fire-and-forget — doesn't block the ping cycle. |

---

## 🎯 Optional Improvements (Future)

- **Redis rate limiting** — Prevent abuse of `/api/ping-all` endpoint
- **Email/webhook alerts** — Notify when a URL goes DOWN
- **Dashboard charts** — Response time graphs over time (Chart.js / Recharts)
- **Authentication** — Prevent unauthorized URL additions
- **Custom intervals** — Per-URL ping frequency
- **Regions** — Ping from multiple geographic locations
- **SSL cert monitoring** — Alert on expiring certificates

---

## 📝 License

MIT
