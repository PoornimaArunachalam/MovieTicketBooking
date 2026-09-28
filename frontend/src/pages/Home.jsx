// frontend/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import './Home.css';

const TICKER_ITEMS = [
  '🎬 Now Showing', 'Blockbusters', '🎟️ Book in 60 Seconds', 'Premium VIP Seats',
  '⭐ Top Rated Films', 'Exclusive Offers', '📱 Digital QR Tickets', 'Unlimited Fun',
  '🎬 Now Showing', 'Blockbusters', '🎟️ Book in 60 Seconds', 'Premium VIP Seats',
  '⭐ Top Rated Films', 'Exclusive Offers', '📱 Digital QR Tickets', 'Unlimited Fun',
];

const STATS = [
  { num: '200+', label: 'Movies' },
  { num: '50+',  label: 'Theatres' },
  { num: '1M+',  label: 'Tickets Sold' },
  { num: '4.9★', label: 'User Rating' },
];

const OFFERS = [
  { icon: '🎟️', title: 'WELCOME50', desc: '20% off up to ₹100 on your first booking', code: 'WELCOME50' },
  { icon: '🎬', title: 'CINE200',   desc: 'Flat 25% off up to ₹200 on premium shows', code: 'CINE200' },
  { icon: '👑', title: 'WEEKENDVIP',desc: '30% off VIP seats every weekend',           code: 'WEEKENDVIP' },
];

const FEATURES = [
  { icon: '💺', title: 'Interactive Seat Map',    desc: 'Real-time visual seat picker. Choose the perfect spot every single time.' },
  { icon: '📱', title: 'Digital QR Tickets',      desc: 'Instant QR code on booking. No printing needed — just walk in.' },
  { icon: '🎁', title: 'Exclusive Member Deals',  desc: 'Regular coupons and offers exclusively for CinePulse members.' },
  { icon: '⚡', title: 'Book in 60 Seconds',      desc: 'Streamlined checkout so you spend less time booking, more time watching.' },
];

export default function Home() {
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hero, setHero]             = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/movies?status=now_showing&limit=8'),
      api.get('/movies?status=coming_soon&limit=4'),
    ]).then(([ns, cs]) => {
      setNowShowing(ns.data.movies || []);
      setComingSoon(cs.data.movies || []);
      if (ns.data.movies?.length) setHero(ns.data.movies[0]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        {hero && (
          <div className="hero-bg"
            style={{ backgroundImage: `url(${hero.banner_url || hero.poster_url})` }} />
        )}
        <div className="hero-overlay" />

        <div className="container hero-content">
          {hero ? (
            <>
              <div className="hero-badge-row">
                <span className="badge badge-primary">{hero.rating}</span>
                <span className="badge badge-success">Now Showing</span>
                <span className="badge badge-muted">{hero.language}</span>
              </div>
              <h1 className="hero-title">{hero.title}</h1>
              <p className="hero-desc">
                {(hero.description || '').slice(0, 160)}{hero.description?.length > 160 ? '…' : ''}
              </p>
              <div className="hero-meta">
                <span>⏱ {hero.duration_mins} min</span>
                <span>🎭 {hero.genre}</span>
                <span>⭐ {parseFloat(hero.avg_rating || 0).toFixed(1)} / 5.0</span>
              </div>
              <div className="hero-actions">
                <Link to={`/movies/${hero.id}`} className="btn btn-primary btn-lg">🎟️ Book Tickets</Link>
                <Link to="/movies" className="btn btn-outline btn-lg">🎬 All Movies</Link>
              </div>
            </>
          ) : !loading ? (
            <>
              <h1 className="hero-title" style={{ fontSize: 'clamp(2.4rem,5vw,4rem)' }}>
                🎬 Welcome to{' '}
                <span className="text-gradient-aurora">CinePulse</span>
              </h1>
              <p className="hero-desc">Your ultimate cinematic ticket booking experience</p>
              <Link to="/movies" className="btn btn-primary btn-lg" style={{ marginTop: 28 }}>
                Explore Movies →
              </Link>
            </>
          ) : null}
        </div>

        {/* animated ticker */}
        <div className="hero-ticker">
          <div className="hero-ticker-track">
            {TICKER_ITEMS.map((item, i) => (
              <span key={i}>
                {i % 2 === 0 ? <span>{item}</span> : item}
                &nbsp;&nbsp;•&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="container">
        <div className="stats-bar">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Now Showing ── */}
      <section className="section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Now <span className="text-gradient">Showing</span></h2>
            <p className="section-sub">Book your seats for the latest blockbusters</p>
          </div>
          <Link to="/movies?status=now_showing" className="btn btn-outline btn-sm">View All →</Link>
        </div>

        {loading ? (
          <div className="grid-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 360, borderRadius: 18 }} />
            ))}
          </div>
        ) : (
          <div className="grid-auto animate-fadeIn">
            {nowShowing.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        )}
      </section>

      {/* ── Offers ── */}
      <section className="offers-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Exclusive <span className="text-gradient">Offers</span></h2>
            <p className="section-sub">Use these coupon codes at checkout</p>
          </div>
        </div>
        <div className="offers-grid">
          {OFFERS.map(o => (
            <div key={o.code} className="offer-card">
              <div className="offer-icon-wrap">{o.icon}</div>
              <div>
                <div className="offer-title">{o.title}</div>
                <div className="offer-desc">{o.desc}</div>
                <div className="offer-code">USE: {o.code}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Coming Soon ── */}
      {comingSoon.length > 0 && (
        <section className="section container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Coming <span className="text-gradient">Soon</span></h2>
              <p className="section-sub">Upcoming movies you'll love</p>
            </div>
            <Link to="/movies?status=coming_soon" className="btn btn-outline btn-sm">View All →</Link>
          </div>
          <div className="grid-auto animate-fadeIn">
            {comingSoon.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="features-section container section">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="section-title">
            Why <span className="text-gradient-aurora">CinePulse?</span>
          </h2>
          <p className="section-sub" style={{ marginTop: 8 }}>
            Everything you need for a perfect movie night
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
