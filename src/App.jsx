import { useState } from 'react';
import AddUrl from './components/AddUrl.jsx';
import UrlList from './components/UrlList.jsx';
import './App.css';

export default function App() {
  const [urls, setUrls] = useState([]);

  // Optimistic add — prepend the new URL to the list
  const handleUrlAdded = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <h1 className="header__title">PingWatch</h1>
        </div>
        <p className="header__subtitle">
          Uptime monitoring for your services — never miss a downtime event
        </p>
      </header>

      {/* Add URL Form */}
      <AddUrl onUrlAdded={handleUrlAdded} />

      {/* URL List */}
      <UrlList urls={urls} setUrls={setUrls} />

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">
          PingWatch v1.0 — Built by Karan M — Pings every 1 minute
        </p>
      </footer>
    </div>
  );
}
