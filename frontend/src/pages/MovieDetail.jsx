// frontend/src/pages/MovieDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Stars } from '../components/MovieCard';
import SeatMap from '../components/SeatMap';
import './MovieDetail.css';

export default function MovieDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Get next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return { value: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) };
  });

  useEffect(() => {
    Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/movies/${id}/reviews`),
    ]).then(([m, r]) => {
      setMovie(m.data);
      setReviews(r.data);
    }).catch(() => navigate('/movies')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    api.get(`/movies/${id}/shows`, { params: { date: selectedDate } }).then(({ data }) => setShows(data));
  }, [id, selectedDate]);

  const handleSelectShow = (show) => {
    if (!user) { addToast('Please login to book tickets', 'error'); navigate('/login'); return; }
    setSelectedShow(show);
    setShowSeatMap(true);
  };

  const handleSubmitReview = async () => {
    if (!user) { addToast('Login to post a review', 'error'); navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/movies/${id}/reviews`, reviewForm);
      addToast('Review posted!', 'success');
      setReviewForm({ rating: 5, comment: '' });
      const { data } = await api.get(`/movies/${id}/reviews`);
      setReviews(data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post review', 'error');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 48, height: 48 }} /></div>;
  if (!movie) return null;

  const ratingAvg = parseFloat(movie.avg_rating || 0);

  return (
    <div className="movie-detail-page">
      {/* Banner */}
      <div className="detail-banner" style={{ backgroundImage: `url(${movie.banner_url || movie.poster_url})` }}>
        <div className="detail-banner-overlay" />
        <div className="container detail-banner-content">
          <div className="detail-main">
            <img src={movie.poster_url} alt={movie.title} className="detail-poster" />
            <div className="detail-info">
              <div className="detail-badges">
                <span className="badge badge-primary">{movie.rating}</span>
                <span className={`badge ${movie.status === 'now_showing' ? 'badge-success' : 'badge-warning'}`}>
                  {movie.status === 'now_showing' ? '🎬 Now Showing' : '🗓 Coming Soon'}
                </span>
                <span className="badge badge-muted">{movie.language}</span>
              </div>
              <h1 className="detail-title">{movie.title}</h1>
              <div className="detail-rating-row">
                <Stars rating={ratingAvg} />
                <span className="detail-rating-num">{ratingAvg.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({reviews.length} reviews)</span>
              </div>
              <div className="detail-tags">
                <span>🎭 {movie.genre}</span>
                <span>⏱ {movie.duration_mins} min</span>
                <span>📅 {new Date(movie.release_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <p className="detail-description">{movie.description}</p>
              {movie.status === 'now_showing' && (
                <button className="btn btn-primary btn-lg" onClick={() => document.getElementById('shows-section').scrollIntoView({ behavior: 'smooth' })}>
                  🎟️ Book Tickets
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        {/* Shows */}
        {movie.status === 'now_showing' && (
          <div id="shows-section" className="shows-section">
            <h2 className="section-title" style={{ marginBottom: 20 }}>Select <span className="text-gradient">Date & Show</span></h2>
            {/* Date picker */}
            <div className="date-row">
              {dates.map(d => (
                <button key={d.value} className={`date-pill ${selectedDate === d.value ? 'active' : ''}`} onClick={() => setSelectedDate(d.value)}>
                  {d.label}
                </button>
              ))}
            </div>
            {shows.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <span style={{ fontSize: 48 }}>🎭</span>
                <p style={{ marginTop: 12 }}>No shows available for this date.</p>
              </div>
            ) : (
              shows.map(theatre => (
                <div key={theatre.theatre_id} className="theatre-card glass-card">
                  <div className="theatre-header">
                    <div>
                      <h3 className="theatre-name">🏛 {theatre.theatre_name}</h3>
                      <p className="theatre-location">📍 {theatre.location}, {theatre.city}</p>
                      <p className="theatre-facilities">✨ {theatre.facilities}</p>
                    </div>
                  </div>
                  <div className="show-times">
                    {theatre.shows.map(show => (
                      <button key={show.id} className="show-time-btn" onClick={() => handleSelectShow({ ...show, theatre_name: theatre.theatre_name })}>
                        <span className="show-time">{show.show_time.substring(0, 5)}</span>
                        <span className="show-price">₹{show.price_regular}</span>
                        <span className="show-screen">{show.screen_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="reviews-section" style={{ marginTop: 64 }}>
          <h2 className="section-title" style={{ marginBottom: 24 }}>Reviews & <span className="text-gradient">Ratings</span></h2>

          {/* Post review */}
          <div className="review-form glass-card">
            <h3 style={{ marginBottom: 16, fontSize: 16 }}>Write a Review</h3>
            <div className="review-stars-select">
              {[1,2,3,4,5].map(s => (
                <button key={s} className={`star-btn ${reviewForm.rating >= s ? 'active' : ''}`}
                  onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>★</button>
              ))}
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 13 }}>{reviewForm.rating}/5</span>
            </div>
            <textarea
              className="input review-textarea"
              placeholder="Share your thoughts about the movie..."
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              rows={3}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSubmitReview} disabled={submittingReview}>
                {submittingReview ? <span className="spinner" /> : '📝 Post Review'}
              </button>
            </div>
          </div>

          {/* Reviews list */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No reviews yet. Be the first!</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} className="review-card glass-card">
                  <div className="review-header">
                    <div className="review-avatar">{(r.user_name || 'A')[0].toUpperCase()}</div>
                    <div>
                      <div className="review-name">{r.user_name || 'Anonymous'}</div>
                      <div className="review-date">{new Date(r.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div className="review-rating-badge">
                      ⭐ {r.rating}/5
                    </div>
                  </div>
                  <Stars rating={r.rating} />
                  <p className="review-comment">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Seat Map Modal */}
      {showSeatMap && selectedShow && (
        <SeatMap
          show={selectedShow}
          movie={movie}
          onClose={() => setShowSeatMap(false)}
        />
      )}
    </div>
  );
}
