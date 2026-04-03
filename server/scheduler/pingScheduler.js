import cron from 'node-cron';
import axios from 'axios';
import Url from '../models/Url.js';

const TIMEOUT_MS = 5000;

/**
 * Ping a single URL and update its record in the database.
 */
async function pingUrl(urlDoc) {
  const start = Date.now();

  try {
    await axios.get(urlDoc.url, {
      timeout: TIMEOUT_MS,
      // Don't follow too many redirects
      maxRedirects: 5,
      // Accept any status to differentiate from network errors
      validateStatus: (status) => status < 500,
    });

    const responseTime = Date.now() - start;

    urlDoc.status = 'UP';
    urlDoc.responseTime = responseTime;
    urlDoc.lastChecked = new Date();
  } catch (error) {
    const responseTime = Date.now() - start;

    urlDoc.status = 'DOWN';
    urlDoc.responseTime = responseTime;
    urlDoc.lastChecked = new Date();

    console.warn(`⚠️  ${urlDoc.url} is DOWN — ${error.message}`);
  }

  await urlDoc.save();
}

/**
 * Ping all monitored URLs in parallel.
 */
async function pingAllUrls() {
  const urls = await Url.find();

  if (urls.length === 0) {
    console.log('📭 No URLs to ping.');
    return;
  }

  console.log(`🔄 Pinging ${urls.length} URL(s)...`);

  await Promise.all(urls.map((urlDoc) => pingUrl(urlDoc)));

  console.log('Ping cycle complete.');
}

/**
 * Start the cron scheduler — runs every 10 minutes.
 * Also performs an initial ping on startup.
 */
export function startScheduler() {
  // Initial ping on startup
  console.log('Running initial ping cycle...');
  pingAllUrls();

  // Schedule every 1 minutes
  cron.schedule('*/1 * * * *', () => {
    console.log(`\n [${new Date().toISOString()}] Scheduled ping cycle`);
    pingAllUrls();
  });

  console.log('Scheduler active — pinging every 10 minutes.');
}
 