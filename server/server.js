import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import urlRoutes from './routes/urlRoutes.js';
import { startScheduler } from './scheduler/pingScheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes 
app.use('/api/url', urlRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server 
const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`PingWatch server running on port ${PORT}`);
  });

  // Start the cron scheduler after DB is connected
  startScheduler();
};

start();
