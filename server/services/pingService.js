import axios from 'axios';
import Url from '../models/Url.js';
import PingHistory from '../models/PingHistory.js';

const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Wait for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ping a single URL with retry logic.
 * Returns { status, responseTime, errorMessage }
 */
async function pingSingleUrl(url) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const start = Date.now();

    try {
      await axios.get(url, {
        timeout: TIMEOUT_MS,
        maxRedirects: 5,
        validateStatus: (status) => status < 500,
        headers: {
          'User-Agent': 'PingWatch/1.0 Uptime Monitor',
        },
      });

      return {
        status: 'UP',
        responseTime: Date.now() - start,
        errorMessage: null,
      };
    } catch (error) {
      const responseTime = Date.now() - start;

      // If this was the last attempt, mark as DOWN
      if (attempt === MAX_RETRIES) {
        console.warn(
          `⚠️  ${url} is DOWN after ${MAX_RETRIES} attempts — ${error.message}`
        );
        return {
          status: 'DOWN',
          responseTime,
          errorMessage: error.message,
        };
      }

      // Wait before retrying
      console.log(
        `🔁 Retry ${attempt}/${MAX_RETRIES} for ${url} — ${error.message}`
      );
      await sleep(RETRY_DELAY_MS);
    }
  }
}

/**
 * Ping a single URL document: ping, update the document, and log history.
 */
async function pingUrlDoc(urlDoc) {
  const result = await pingSingleUrl(urlDoc.url);

  // Update counters for uptime %
  urlDoc.totalChecks += 1;
  if (result.status === 'UP') {
    urlDoc.successfulChecks += 1;
  }

  urlDoc.status = result.status;
  urlDoc.responseTime = result.responseTime;
  urlDoc.lastChecked = new Date();
  urlDoc.uptimePercent = parseFloat(
    ((urlDoc.successfulChecks / urlDoc.totalChecks) * 100).toFixed(2)
  );

  await urlDoc.save();

  // Log to history (fire-and-forget, don't block the cycle)
  PingHistory.create({
    urlId: urlDoc._id,
    status: result.status,
    responseTime: result.responseTime,
    checkedAt: new Date(),
    errorMessage: result.errorMessage,
  }).catch((err) => {
    console.error(`Failed to log history for ${urlDoc.url}:`, err.message);
  });
}

/**
 * Run a full ping cycle for all monitored URLs.
 * Returns a summary object.
 */
export async function runPingCycle() {
  const urls = await Url.find();

  if (urls.length === 0) {
    console.log('📭 No URLs to ping.');
    return { total: 0, up: 0, down: 0, duration: 0 };
  }

  const startTime = Date.now();
  console.log(`🔄 Pinging ${urls.length} URL(s)...`);

  await Promise.all(urls.map((urlDoc) => pingUrlDoc(urlDoc)));

  const duration = Date.now() - startTime;
  const up = urls.filter((u) => u.status === 'UP').length;
  const down = urls.filter((u) => u.status === 'DOWN').length;

  console.log(
    `✅ Ping cycle complete in ${duration}ms — ${up} UP, ${down} DOWN`
  );

  return {
    total: urls.length,
    up,
    down,
    duration,
    timestamp: new Date().toISOString(),
  };
}
