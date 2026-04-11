import { useState } from 'react';
import API_BASE from '../config/api.js';

export default function AddUrl({ onUrlAdded }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    if (!trimmed) return;

    // Client-side validation
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setError('URL must start with http:// or https://');
        return;
      }
    } catch {
      setError('Please enter a valid URL (e.g. https://example.com)');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add URL');
        return;
      }

      setUrl('');
      onUrlAdded(data);
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-url">
      <form className="add-url__form" onSubmit={handleSubmit}>
        <input
          id="url-input"
          type="text"
          className="add-url__input"
          placeholder="Enter URL to monitor (e.g. https://example.com)"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
          autoComplete="url"
        />
        <button
          id="add-url-btn"
          type="submit"
          className="add-url__btn"
          disabled={loading || !url.trim()}
        >
          {loading ? 'Adding…' : '+ Monitor'}
        </button>
      </form>
      {error && <div className="add-url__error">{error}</div>}
    </div>
  );
}
