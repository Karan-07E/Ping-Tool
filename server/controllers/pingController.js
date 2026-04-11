import { runPingCycle } from '../services/pingService.js';

/**
 * POST /api/ping-all — Trigger a full ping cycle.
 * Designed to be called by an external cron service (e.g. cron-job.org).
 */
export const pingAll = async (_req, res) => {
  try {
    console.log(`\n⏰ [${new Date().toISOString()}] Ping-all triggered`);
    const result = await runPingCycle();

    res.json({
      message: 'Ping cycle completed',
      ...result,
    });
  } catch (error) {
    console.error('Ping cycle failed:', error.message);
    res.status(500).json({ error: 'Ping cycle failed', details: error.message });
  }
};
