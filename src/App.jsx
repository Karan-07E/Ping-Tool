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
          Monitor your URLs · Keep your services alive
        </p>
      </header>

      {/* Add URL Form */}
      <AddUrl onUrlAdded={handleUrlAdded} />

      {/* URL List */}
      <UrlList urls={urls} setUrls={setUrls} />
    </div>
  );
}
