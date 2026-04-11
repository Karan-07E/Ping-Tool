import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import urlRoutes from './routes/urlRoutes.js';
import pingRoutes from './routes/pingRoutes.js';

const app = express();

// ─── Middleware ───
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'DELETE'],
  })
);
app.use(express.json());

// ─── Cached DB connection (works for both local & serverless) ───
let cachedConnection = null;

export async function ensureDBConnected() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${cachedConnection.connection.host}`);
  return cachedConnection;
}

// Connect to DB before every request (no-op if already connected)
app.use(async (_req, _res, next) => {
  try {
    await ensureDBConnected();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    next(err);
  }
});

// ─── Routes ───
app.use('/api/url', urlRoutes);
app.use('/api/ping-all', pingRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─── Global error handler ───
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

export default app;
