import 'dotenv/config';
import app from './app.js';
import { ensureDBConnected } from './app.js';
import { startScheduler } from './scheduler/pingScheduler.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await ensureDBConnected();

  app.listen(PORT, () => {
    console.log(`PingWatch server running on port ${PORT}`);
  });

  // Start the cron scheduler after DB is connected
  startScheduler();
};

start();
