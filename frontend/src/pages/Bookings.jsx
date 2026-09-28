// frontend/src/pages/Bookings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import './Bookings.css';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [ticketModal, setTicketModal] = useState(null);
  const { addToast } = useToast();

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/my').then(({ data }) => setBookings(data)).catch(() => setBookings([])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    setCancelling(true);
    try {
      await api.put(`/bookings/${id}/cancel`);
      addToast('Booking cancelled. Refund in 3-5 days.', 'info');
      fetchBookings();
    } catch (err) {
      addToast(err.response?.data?.message || 'Cancel failed', 'error');
    } finally { setCancelling(false); setCancelId(null); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" style={{ width: 48, height: 48 }} /></div>;

  return (
    <div className="bookings-page container" style={{ paddingTop: 100, paddingBottom: 64 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="section-title">My <span className="text-gradient">Bookings</span></h1>
          <p className="section-sub">Your complete ticket booking history</p>
        </div>
        <Link to="/movies" className="btn btn-primary btn-sm">🎬 Book More</Link>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 0' }}>
          <div style={{ fontSize: 64 }}>🎟️</div>
          <h3 style={{ margin: '16px 0 8px' }}>No bookings yet</h3>
          <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Explore movies and book your first ticket!</p>
          <Link to="/movies" className="btn btn-primary">Browse Movies</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b.id} className={`booking-card glass-card ${b.booking_status === 'cancelled' ? 'cancelled' : ''}`}>
              <img src={b.poster_url} alt={b.movie_title} className="booking-poster" />
              <div className="booking-info">
                <div className="booking-top">
                  <div>
                    <h3 className="booking-movie">{b.movie_title}</h3>
                    <p className="booking-meta">📅 {new Date(b.show_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} &nbsp;|&nbsp; ⏰ {(b.show_time || '').substring(0, 5)}</p>
                    <p className="booking-meta">🏛 {b.theatre_name}, {b.city} &nbsp;|&nbsp; 🎭 {b.screen_name}</p>
                    <p className="booking-meta">💺 Seats: <strong>{b.seats}</strong></p>
                  </div>
                  <div className="booking-right">
                    <span className={`badge ${b.booking_status === 'confirmed' ? 'badge-success' : 'badge-primary'}`}>
                      {b.booking_status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                    </span>
                    <div className="booking-amount">₹{b.final_amount}</div>
                    <div className="booking-code">{b.booking_code}</div>
                  </div>
                </div>
                <div className="booking-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setTicketModal(b)}>
                    🎟️ View Ticket
                  </button>
                  {b.booking_status === 'confirmed' && new Date(b.show_date) > new Date() && (
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelId(b.id)}>
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {cancelId && (
        <div className="modal-overlay" onClick={() => setCancelId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Booking?</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setCancelId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to cancel this booking? Refund will be processed within 3-5 business days.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCancelId(null)}>Keep Booking</button>
              <button className="btn btn-danger" onClick={() => handleCancel(cancelId)} disabled={cancelling}>
                {cancelling ? <span className="spinner" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {ticketModal && (
        <div className="modal-overlay" onClick={() => setTicketModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎟️ E-Ticket</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setTicketModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="e-ticket-mini">
                <div style={{ background: 'var(--accent-gradient)', padding: '14px 20px', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
                  <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{ticketModal.movie_title}</h3>
                </div>
                <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)' }}>
                  <div className="ticket-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    {[
                      ['📅 Date', new Date(ticketModal.show_date).toLocaleDateString('en-IN')],
                      ['⏰ Time', (ticketModal.show_time || '').substring(0, 5)],
                      ['🏛 Theatre', ticketModal.theatre_name],
                      ['🏙 City', ticketModal.city],
                      ['🎭 Screen', ticketModal.screen_name],
                      ['💺 Seats', ticketModal.seats],
                      ['💳 Paid', `₹${ticketModal.final_amount}`],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', borderTop: '2px dashed var(--border)', paddingTop: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Booking Code</div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3, color: 'var(--accent)', fontFamily: 'monospace' }}>{ticketModal.booking_code}</div>
                  </div>
                  {ticketModal.qr_code_data && (
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <img src={ticketModal.qr_code_data} alt="QR" style={{ width: 100, height: 100 }} />
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Scan at entrance</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
