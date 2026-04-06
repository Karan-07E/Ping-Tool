import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import urlRoutes from './routes/urlRoutes.js';

const app = express();

// Middleware
app.use(cors());
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

// Routes
app.use('/api/url', urlRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
