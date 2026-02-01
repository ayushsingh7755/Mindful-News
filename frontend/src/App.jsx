import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css'; 

const API_BASE_URL = 'http://localhost:5000/api/news/headlines';

function App() {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('general');
  const [sentiment, setSentiment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch data based on filters using useCallback for optimization
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE_URL, {
        params: {
          category: category,
          sentiment: sentiment,
        },
      });
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError("Could not load news. Check your API key or server status.");
      setArticles([]); 
    } finally {
      setLoading(false);
    }
  }, [category, sentiment]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]); 

  const categories = ['business', 'technology', 'health', 'sports', 'general', 'science'];
  const sentiments = [
    { label: 'All', value: '' }, 
    { label: '😊 Positive', value: 'Positive' }, 
    { label: '😐 Neutral', value: 'Neutral' }, 
    { label: '😞 Negative', value: 'Negative' }
  ];

  const getSentimentClass = (label) => {
    if (label === 'Positive') return 'card-positive';
    if (label === 'Negative') return 'card-negative';
    return 'card-neutral';
  };

  return (
    <div className="App">
      <h1>NewsMood Filtered Headlines 📰</h1>
      <p className="tagline">Real-time news headlines, classified by sentiment.</p>
      
      {/* --- Filter Controls --- */}
      <div className="filters">
        <label htmlFor="category-select">Category:</label>
        <select 
            id="category-select" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
        </select>

        {sentiments.map(s => (
          <button
            key={s.value}
            className={`sentiment-btn ${sentiment === s.value ? 'active' : ''}`}
            onClick={() => setSentiment(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <hr/>

      {/* --- News Feed --- */}
      <div className="news-feed">
        {loading && <p className="status-message">Loading and Analyzing News...</p>}
        {error && <p className="status-message error-message">{error}</p>}
        
        {!loading && !error && articles.length === 0 && (
            <p className="status-message">No articles found for the selected filters.</p>
        )}

        {!loading && !error && articles.map((article, index) => (
            <div key={index} className={`news-card ${getSentimentClass(article.sentiment)}`}>
              <div className="card-header">
                <span className={`sentiment-badge ${getSentimentClass(article.sentiment)}`}>
                    {article.sentiment}
                </span>
                <span className="source-name">{article.source.name}</span>
              </div>
              <h3>{article.title}</h3>
              <p className="description">{article.description?.substring(0, 100)}...</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="read-more">
                Read More →
              </a>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default App;