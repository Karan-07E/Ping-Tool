# 📡 PingWatch — Uptime Monitor & Keep-Alive Tool

A full-stack web application that monitors URLs and pings them every 10 minutes to track uptime and keep services alive.

## Folder Structure

```
render_tool/
├── server/                     # Backend (Express + MongoDB)
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   └── Url.js              # Mongoose schema
│   ├── controllers/
│   │   └── urlController.js    # Route handlers
│   ├── routes/
│   │   └── urlRoutes.js        # Express routes
│   ├── scheduler/
│   │   └── pingScheduler.js    # node-cron ping logic
│   └── server.js               # Entry point
├── src/                        # Frontend (Vite + React)
│   ├── components/
│   │   ├── AddUrl.jsx          # URL input form
│   │   ├── UrlList.jsx         # URL list with auto-refresh
│   │   └── UrlCard.jsx         # Individual URL display
│   ├── App.jsx                 # Main layout
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles & design tokens
│   └── main.jsx                # React entry point
├── index.html                  # HTML shell
├── vite.config.js              # Vite config with API proxy
├── package.json                # Dependencies & scripts
├── .env                        # Environment config
└── README.md                   # You are here!
```

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** — `npm install -g pnpm`
- **MongoDB** — running locally or a cloud instance (MongoDB Atlas)

## Setup & Run

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Edit `.env` to point to your MongoDB instance:

```env
MONGODB_URI=mongodb://localhost:27017/pingwatch
PORT=5000
```

### 3. Start MongoDB (if local)

```bash
mongod
```

### 4. Run the application

```bash
# Run both backend + frontend concurrently
pnpm dev

# Or run separately:
pnpm dev:backend    # Express on port 5000
pnpm dev:frontend   # Vite on port 5173
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint         | Description          |
|--------|-----------------|----------------------|
| POST   | `/api/url`      | Add a URL to monitor |
| GET    | `/api/url`      | List all URLs        |
| DELETE  | `/api/url/:id`  | Delete a URL         |
| GET    | `/api/health`   | Health check         |

## How It Works

1. **Add a URL** — validated on both client and server side
2. **Scheduler pings** all URLs every **10 minutes** using `node-cron`
3. Each URL is pinged with a **5-second timeout** via `axios`
4. All pings run in **parallel** using `Promise.all`
5. Status is updated: `UP` (response received) or `DOWN` (timeout/error)
6. Frontend **auto-refreshes** every **20 seconds** to pick up new statuses

## ⚠️ Deployment Notes

### Free-Tier Platforms (Render, Railway, etc.)

Free-tier platforms typically **spin down idle services after ~15 minutes**. This means:

- **Your cron job will stop running** when the server sleeps
- URLs won't be pinged while the server is idle
- The server wakes up on the next incoming request

### Workarounds

1. **External Cron Service** — Use [cron-job.org](https://cron-job.org), [UptimeRobot](https://uptimerobot.com), or [Easycron](https://www.easycron.com) to ping your `/api/health` endpoint every 5–10 minutes, keeping the server awake.

2. **Separate Worker** — Deploy the scheduler as a separate worker process (supported by Render and Railway).

3. **Paid Tier** — Upgrade to a paid plan that doesn't sleep (e.g., Render Starter at $7/mo).

## Optional Improvements

- **WebSocket** for real-time status updates instead of polling
- **Response history** — store ping results over time and show uptime % graphs
- **Email/Slack notifications** when a URL goes DOWN
- **Authentication** — user accounts with their own URL lists
- **Custom ping intervals** per URL
- **SSL certificate monitoring** — check expiry dates
- **Bulk import** — CSV/JSON upload
- **Dark/Light theme toggle**
- **Rate limiting** on the API to prevent abuse
- **Docker Compose** setup for one-command deployment
