import connectDB from './_lib/db.js';
import Url from './_lib/Url.js';

const TIMEOUT_MS = 5000;

/**
 * Ping a single URL and update its record.
 */
async function pingUrl(urlDoc) {
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(urlDoc.url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - start;

    urlDoc.status = response.status < 500 ? 'UP' : 'DOWN';
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
 * GET /api/cron — Vercel Cron Job handler
 * Pings all monitored URLs.
 */
export default async function handler(req, res) {
  await connectDB();

  const urls = await Url.find();

  if (urls.length === 0) {
    return res.status(200).json({ message: 'No URLs to ping' });
  }

  console.log(`🔄 Pinging ${urls.length} URL(s)...`);

  await Promise.all(urls.map((urlDoc) => pingUrl(urlDoc)));

  console.log('✅ Ping cycle complete.');

  return res.status(200).json({
    message: `Pinged ${urls.length} URL(s)`,
    timestamp: new Date().toISOString(),
  });
}
