import cron from 'node-cron';
import { runPingCycle } from '../services/pingService.js';

/**
 * Start the in-process cron scheduler.
 *
 * This is a BACKUP mechanism. The primary trigger should be an external
 * cron service hitting POST /api/ping-all every 10 minutes.
 *
 * Why external cron is preferred:
 * - Render/Railway free tiers put services to sleep after inactivity.
 * - When the server sleeps, setInterval/node-cron stop running.
 * - An external cron (cron-job.org, UptimeRobot, Cronitor) wakes the
 *   server with an HTTP request AND triggers the ping cycle in one shot.
 */
export function startScheduler() {
  // Run an initial ping on startup
  console.log('🚀 Running initial ping cycle on startup...');
  runPingCycle().catch((err) => {
    console.error('Initial ping cycle failed:', err.message);
  });

  // Schedule every 1 minutes as a fallback
  cron.schedule('*/1 * * * *', () => {
    console.log(`\n⏰ [${new Date().toISOString()}] Scheduled ping cycle (node-cron)`);
    runPingCycle().catch((err) => {
      console.error('Scheduled ping cycle failed:', err.message);
    });
  });

  console.log('📅 Scheduler active — fallback cron every 10 minutes.');
  console.log('💡 For production: configure cron-job.org to POST /api/ping-all every 10 min.');
}