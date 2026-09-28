// frontend/src/components/MovieCard.jsx
import { Link } from 'react-router-dom';
import './MovieCard.css';

export function Stars({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'star-empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function MovieCard({ movie }) {
  const tags = (movie.genre || '').split('/').map(g => g.trim()).filter(Boolean);
  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <div className="movie-poster-wrap">
        <img
          src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}
          alt={movie.title}
          className="movie-poster"
          loading="lazy"
        />
        <div className="movie-overlay">
          <button className="btn-play">▶ Book Now</button>
        </div>
        <div className="movie-badges">
          <span className="badge badge-primary">{movie.rating || 'UA'}</span>
          {movie.status === 'coming_soon' && <span className="badge badge-warning">Coming Soon</span>}
          {movie.status === 'now_showing' && <span className="badge badge-success">Now Showing</span>}
        </div>
        {movie.language && (
          <div className="movie-lang">{movie.language}</div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <Stars rating={parseFloat(movie.avg_rating) || 0} />
          <span className="movie-rating-num">{parseFloat(movie.avg_rating || 0).toFixed(1)}</span>
        </div>
        <div className="movie-tags">
          {tags.slice(0, 2).map(t => <span key={t} className="movie-tag">{t}</span>)}
          {movie.duration_mins && <span className="movie-tag">⏱ {movie.duration_mins}m</span>}
        </div>
      </div>
    </Link>
  );
}
