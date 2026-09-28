// frontend/src/components/SeatMap.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import './SeatMap.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = 10;
const VIP_ROWS = ['A', 'B', 'C'];

export default function SeatMap({ show, movie, onClose }) {
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1); // 1=seats, 2=payment, 3=confirm
  const [payment, setPayment] = useState('card');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    api.get(`/bookings/show/${show.id}/seats`)
      .then(({ data }) => setBookedSeats(data.bookedSeats || []))
      .catch(() => {});
  }, [show.id]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const calcTotal = () => {
    return selectedSeats.reduce((sum, seat) => {
      const row = seat[0];
      return sum + (VIP_ROWS.includes(row) ? parseFloat(show.price_vip || 350) : parseFloat(show.price_regular || 200));
    }, 0);
  };

  const total = calcTotal();
  const final = Math.max(0, total - discount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const { data } = await api.post('/bookings/validate-coupon', { code: coupon, amount: total });
      setDiscount(data.discount);
      setCouponMsg(`✅ ${data.description} — Saved ₹${data.discount}`);
    } catch (err) {
      setCouponMsg('❌ ' + (err.response?.data?.message || 'Invalid coupon'));
      setDiscount(0);
    } finally { setCouponLoading(false); }
  };

  const handleBook = async () => {
    setBooking(true);
    try {
      const { data } = await api.post('/bookings', {
        show_id: show.id,
        seats: selectedSeats.join(','),
        coupon_code: discount > 0 ? coupon : null,
        payment_method: payment
      });
      setConfirmedBooking(data.booking);
      setStep(3);
      addToast('🎉 Booking confirmed!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'error');
    } finally { setBooking(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="seatmap-modal">
        {/* Header */}
        <div className="seatmap-header">
          <div>
            <h2 className="seatmap-title">{movie?.title}</h2>
            <p className="seatmap-meta">
              🏛 {show.theatre_name} &nbsp;|&nbsp; 📅 {show.show_date} &nbsp;|&nbsp; ⏰ {(show.show_time || '').substring(0, 5)} &nbsp;|&nbsp; 🎭 {show.screen_name}
            </p>
          </div>
          <button className="seatmap-close" onClick={onClose}>✕</button>
        </div>

        {/* Steps */}
        <div className="seatmap-steps">
          {['Select Seats', 'Payment', 'Confirmation'].map((s, i) => (
            <div key={s} className={`step-item ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="seatmap-body">
          {/* STEP 1 – Seat Selection */}
          {step === 1 && (
            <>
              <div className="seat-legend">
                <div className="legend-item"><div className="legend-box available" /> Available</div>
                <div className="legend-item"><div className="legend-box selected" /> Selected</div>
                <div className="legend-item"><div className="legend-box booked" /> Booked</div>
                <div className="legend-item"><div className="legend-box vip" /> VIP (₹{show.price_vip})</div>
              </div>
              <div className="screen-indicator"></div>
              <div className="seat-map">
                {ROWS.map(row => (
                  <div key={row} className="seat-row">
                    <div className="seat-row-label">{row}</div>
                    {[...Array(COLS)].map((_, ci) => {
                      const seatId = `${row}${ci + 1}`;
                      const isBooked = bookedSeats.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);
                      const isVip = VIP_ROWS.includes(row);
                      return (
                        <div
                          key={seatId}
                          className={`seat ${isBooked ? 'seat-booked' : ''} ${isSelected ? 'seat-selected' : ''} ${isVip && !isBooked && !isSelected ? 'seat-vip' : ''}`}
                          onClick={() => toggleSeat(seatId)}
                          title={isVip ? `VIP ₹${show.price_vip}` : `Regular ₹${show.price_regular}`}
                        >
                          {seatId}
                        </div>
                      );
                    })}
                    <div className="seat-row-label">{row}</div>
                  </div>
                ))}
              </div>
              <div className="seat-summary">
                <div>
                  {selectedSeats.length > 0 ? (
                    <span>Selected: <strong>{selectedSeats.join(', ')}</strong></span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Click seats to select</span>
                  )}
                </div>
                <div className="seat-total">Total: <strong>₹{total}</strong></div>
              </div>
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-lg"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep(2)}
                >
                  Continue to Payment →
                </button>
              </div>
            </>
          )}

          {/* STEP 2 – Payment */}
          {step === 2 && (
            <div className="payment-section">
              <h3 style={{ marginBottom: 20 }}>Payment Details</h3>
              {/* Coupon */}
              <div className="coupon-row">
                <input className="input" placeholder="Enter coupon code (e.g. WELCOME50)" value={coupon}
                  onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(''); setDiscount(0); }} />
                <button className="btn btn-outline" onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? <span className="spinner" /> : 'Apply'}
                </button>
              </div>
              {couponMsg && <p className="coupon-msg">{couponMsg}</p>}

              {/* Payment method */}
              <div style={{ margin: '20px 0' }}>
                <label className="input-label" style={{ marginBottom: 10, display: 'block' }}>Payment Method</label>
                <div className="payment-methods">
                  {[
                    { id: 'card', label: '💳 Credit/Debit Card' },
                    { id: 'upi', label: '📱 UPI' },
                    { id: 'netbanking', label: '🏦 Net Banking' },
                    { id: 'wallet', label: '👝 Wallet' },
                  ].map(pm => (
                    <label key={pm.id} className={`payment-method ${payment === pm.id ? 'active' : ''}`}>
                      <input type="radio" name="payment" value={pm.id} checked={payment === pm.id}
                        onChange={() => setPayment(pm.id)} />
                      {pm.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="price-breakdown glass-card" style={{ padding: '16px 20px' }}>
                <div className="price-row"><span>Subtotal ({selectedSeats.length} seats)</span><span>₹{total}</span></div>
                {discount > 0 && <div className="price-row discount"><span>Discount ({coupon})</span><span>-₹{discount}</span></div>}
                <div className="price-row"><span>Convenience Fee</span><span>₹0</span></div>
                <hr className="divider" style={{ margin: '10px 0' }} />
                <div className="price-row total"><span>Total Amount</span><span>₹{final}</span></div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={booking}>
                  {booking ? <><span className="spinner" /> Processing...</> : `🔒 Pay ₹${final}`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 – Confirmation */}
          {step === 3 && confirmedBooking && (
            <div className="confirmation-section">
              <div className="confirm-checkmark">🎉</div>
              <h2 className="confirm-title">Booking Confirmed!</h2>
              <p className="confirm-subtitle">Your e-ticket has been generated</p>

              <div className="e-ticket">
                <div className="ticket-header">
                  <span className="ticket-logo">🎬 CinePulse</span>
                  <span className={`badge badge-success`}>Confirmed</span>
                </div>
                <div className="ticket-body">
                  <div className="ticket-movie">{movie?.title}</div>
                  <div className="ticket-details">
                    <div><span>📅 Date</span><strong>{confirmedBooking.show?.show_date}</strong></div>
                    <div><span>⏰ Time</span><strong>{(confirmedBooking.show?.show_time || '').substring(0, 5)}</strong></div>
                    <div><span>🏛 Theatre</span><strong>{confirmedBooking.show?.theatre_name}</strong></div>
                    <div><span>💺 Seats</span><strong>{confirmedBooking.seats?.join(', ')}</strong></div>
                    <div><span>💳 Paid</span><strong>₹{confirmedBooking.final_amount}</strong></div>
                  </div>
                  <div className="ticket-code">
                    <span className="ticket-code-label">Booking Code</span>
                    <span className="ticket-code-val">{confirmedBooking.booking_code}</span>
                  </div>
                </div>
                <div className="ticket-qr">
                  <img src={confirmedBooking.qr_code} alt="QR Code" style={{ width: 120, height: 120 }} />
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Scan at theatre entrance</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <button className="btn btn-outline" onClick={() => navigate('/bookings')}>My Bookings</button>
                <button className="btn btn-primary" onClick={onClose}>Browse More</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
