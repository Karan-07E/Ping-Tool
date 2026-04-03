import connectDB from './_lib/db.js';
import Url from './_lib/Url.js';

/**
 * Validates that a string is a well-formed HTTPS URL.
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  await connectDB();

  // ─── GET /api/url — list all monitored URLs ───
  if (req.method === 'GET') {
    try {
      const urls = await Url.find().sort({ createdAt: -1 });
      return res.status(200).json(urls);
    } catch (error) {
      console.error('Error fetching URLs:', error.message);
      return res.status(500).json({ error: 'Failed to fetch URLs' });
    }
  }

  // ─── POST /api/url — add a new URL ───
  if (req.method === 'POST') {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      if (!isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
      }

      const existing = await Url.findOne({ url });
      if (existing) {
        return res.status(409).json({ error: 'This URL is already being monitored' });
      }

      const newUrl = await Url.create({ url });
      return res.status(201).json(newUrl);
    } catch (error) {
      console.error('Error adding URL:', error.message);
      return res.status(500).json({ error: 'Failed to add URL' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
