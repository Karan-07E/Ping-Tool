import { useState, useEffect } from 'react';
import API_BASE from '../config/api.js';

/**
 * Format a date for display — relative if recent, otherwise absolute.
 */
function formatTime(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get the CSS class for the uptime fill bar based on percentage.
 */
function getUptimeClass(pct) {
  if (pct >= 95) return 'url-card__uptime-fill--good';
  if (pct >= 80) return 'url-card__uptime-fill--warn';
  return 'url-card__uptime-fill--bad';
}

export default function UrlCard({ url, onDelete }) {
  const statusKey = (url.status || 'PENDING').toLowerCase();
  const [history, setHistory] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // Fetch last 24 pings for the sparkline
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/url/${url._id}/history?limit=24`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.reverse()); // oldest → newest for sparkline
        }
      } catch {
        // Non-critical, silently ignore
      }
    };

    fetchHistory();
  }, [url._id, url.lastChecked]); // re-fetch when lastChecked changes

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      const res = await fetch(`${API_BASE}/api/url/${url._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onDelete(url._id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`url-card url-card--${statusKey}`}
      id={`url-card-${url._id}`}
    >
      {/* Status dot */}
      <div className={`url-card__status url-card__status--${statusKey}`} />

      {/* Body */}
      <div className="url-card__body">
        <div className="url-card__url">{url.url}</div>

        <div className="url-card__meta">
          <span className={`url-card__badge url-card__badge--${statusKey}`}>
            {url.status || 'PENDING'}
          </span>

          {url.responseTime !== null && url.responseTime !== undefined && (
            <span className="url-card__meta-item">
              <span className="url-card__meta-icon">⚡</span>
              {url.responseTime}ms
            </span>
          )}

          <span className="url-card__meta-item">
            <span className="url-card__meta-icon">🕐</span>
            {formatTime(url.lastChecked)}
          </span>

          {url.uptimePercent !== null && url.uptimePercent !== undefined && (
            <span className="url-card__uptime">
              <span className="url-card__uptime-bar">
                <span
                  className={`url-card__uptime-fill ${getUptimeClass(url.uptimePercent)}`}
                  style={{ width: `${url.uptimePercent}%` }}
                />
              </span>
              {url.uptimePercent}%
            </span>
          )}
        </div>

        {/* Mini sparkline from recent history */}
        {history.length > 0 && (
          <div className="url-card__history">
            {history.map((h, i) => (
              <div
                key={h._id || i}
                className={`url-card__history-bar url-card__history-bar--${h.status.toLowerCase()}`}
                style={{
                  height: h.status === 'UP'
                    ? `${Math.max(30, Math.min(100, (1 - h.responseTime / 3000) * 100))}%`
                    : '100%',
                }}
                title={`${h.status} — ${h.responseTime}ms — ${new Date(h.checkedAt).toLocaleTimeString()}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        className="url-card__delete"
        onClick={handleDelete}
        disabled={deleting}
        title="Remove URL"
        aria-label={`Delete ${url.url}`}
      >
        {deleting ? '…' : '✕'}
      </button>
    </div>
  );
}
