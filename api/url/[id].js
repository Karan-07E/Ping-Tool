import connectDB from '../_lib/db.js';
import Url from '../_lib/Url.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { id } = req.query;
    const deleted = await Url.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'URL not found' });
    }

    return res.status(200).json({ message: 'URL deleted successfully', id });
  } catch (error) {
    console.error('Error deleting URL:', error.message);
    return res.status(500).json({ error: 'Failed to delete URL' });
  }
}
