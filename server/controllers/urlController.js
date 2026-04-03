import Url from '../models/Url.js';

/**
 * Validates that a string is a well-formed HTTP/HTTPS URL.
 */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * POST /api/url — Add a new URL to monitor
 */
export const addUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
    }

    // Check for duplicates
    const existing = await Url.findOne({ url });
    if (existing) {
      return res.status(409).json({ error: 'This URL is already being monitored' });
    }

    const newUrl = await Url.create({ url });
    res.status(201).json(newUrl);
  } catch (error) {
    console.error('Error adding URL:', error.message);
    res.status(500).json({ error: 'Failed to add URL' });
  }
};

/**
 * GET /api/url — List all monitored URLs
 */
export const getUrls = async (_req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error.message);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
};

/**
 * DELETE /api/url/:id — Remove a monitored URL
 */
export const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Url.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully', id });
  } catch (error) {
    console.error('Error deleting URL:', error.message);
    res.status(500).json({ error: 'Failed to delete URL' });
  }
};
