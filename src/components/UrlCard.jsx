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
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function UrlCard({ url, onDelete }) {
  const statusKey = (url.status || 'PENDING').toLowerCase();

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/url/${url._id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(url._id);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="url-card" id={`url-card-${url._id}`}>
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
        </div>
      </div>

      {/* Delete */}
      <button
        className="url-card__delete"
        onClick={handleDelete}
        title="Remove URL"
        aria-label={`Delete ${url.url}`}
      >
        ✕
      </button>
    </div>
  );
}
