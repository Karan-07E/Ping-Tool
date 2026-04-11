import { useState, useEffect, useCallback } from 'react';
import UrlCard from './UrlCard.jsx';
import API_BASE from '../config/api.js';

const REFRESH_INTERVAL = 20_000; // 20 seconds

export default function UrlList({ urls, setUrls }) {
  const [loading, setLoading] = useState(true);

  const fetchUrls = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/url`);
      if (res.ok) {
        const data = await res.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    } finally {
      setLoading(false);
    }
  }, [setUrls]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchUrls();
    const interval = setInterval(fetchUrls, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUrls]);

  const handleDelete = (id) => {
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner" />
        <p>Loading monitored URLs…</p>
      </div>
    );
  }

  const upCount = urls.filter((u) => u.status === 'UP').length;
  const downCount = urls.filter((u) => u.status === 'DOWN').length;
  const pendingCount = urls.filter(
    (u) => u.status === 'PENDING' || !u.status
  ).length;

  return (
    <div className="url-list">
      {/* Stats */}
      {urls.length > 0 && (
        <div className="stats">
          <div className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--total" />
            {urls.length} monitored
          </div>
          <div className="stat-chip">
            <span className="stat-chip__dot stat-chip__dot--up" />
            {upCount} up
          </div>
          {downCount > 0 && (
            <div className="stat-chip">
              <span className="stat-chip__dot stat-chip__dot--down" />
              {downCount} down
            </div>
          )}
          {pendingCount > 0 && (
            <div className="stat-chip">
              <span className="stat-chip__dot stat-chip__dot--pending" />
              {pendingCount} pending
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="url-list__header">
        <h2 className="url-list__title">Monitored URLs</h2>
        <span className="url-list__refresh-info">
          <span className="url-list__refresh-dot" />
          Auto-refresh every 20s
        </span>
      </div>

      {/* List */}
      {urls.length === 0 ? (
        <div className="url-list__empty">
          <div className="url-list__empty-icon">📡</div>
          <p className="url-list__empty-text">
            No URLs being monitored yet
          </p>
          <p className="url-list__empty-hint">
            Add a URL above to start tracking its uptime
          </p>
        </div>
      ) : (
        <div className="url-list__grid">
          {urls.map((url) => (
            <UrlCard key={url._id} url={url} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
