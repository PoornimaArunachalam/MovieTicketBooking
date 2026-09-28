// frontend/src/pages/Movies.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import './Movies.css';

const genres = ['All', 'Action', 'Drama', 'Comedy', 'Sci-Fi', 'Fantasy', 'Thriller', 'Mystery', 'Romance'];
const languages = ['All', 'English', 'Hindi', 'Tamil', 'Telugu'];

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState('All');
  const [language, setLanguage] = useState('All');
  const [status, setStatus] = useState(searchParams.get('status') || 'now_showing');

  useEffect(() => {
    setLoading(true);
    const params = { limit: 24 };
    if (search) params.search = search;
    if (genre !== 'All') params.genre = genre;
    if (language !== 'All') params.language = language;
    if (status) params.status = status;
    api.get('/movies', { params })
      .then(({ data }) => setMovies(data.movies || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [search, genre, language, status]);

  return (
    <div className="movies-page" style={{ paddingTop: 80 }}>
      <div className="movies-hero">
        <div className="container">
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 8 }}>
            Explore <span className="text-gradient">Movies</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover and book your next cinematic experience</p>
        </div>
      </div>

      <div className="container">
        {/* Filters */}
        <div className="movies-filters glass-card">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
            <input
              className="input filter-input"
              placeholder="Search movies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-pills">
                {['now_showing', 'coming_soon'].map(s => (
                  <button key={s} className={`filter-pill ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
                    {s === 'now_showing' ? '🎬 Now Showing' : '🗓 Coming Soon'}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <div className="filter-pills scroll-x">
                {genres.map(g => (
                  <button key={g} className={`filter-pill ${genre === g ? 'active' : ''}`} onClick={() => setGenre(g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label className="filter-label">Language</label>
              <div className="filter-pills">
                {languages.map(l => (
                  <button key={l} className={`filter-pill ${language === l ? 'active' : ''}`} onClick={() => setLanguage(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="movies-results">
          {loading ? (
            <div className="grid-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 360, borderRadius: 16 }} />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🎭</div>
              <h3>No movies found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <p className="results-count">{movies.length} movies found</p>
              <div className="grid-auto animate-fadeIn">
                {movies.map(m => <MovieCard key={m.id} movie={m} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
