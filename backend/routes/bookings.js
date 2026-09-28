// backend/routes/bookings.js
const express = require('express');
const pool = require('../config/db');
const QRCode = require('qrcode');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

function genBookingCode() {
  return 'CP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
}

// GET /api/bookings/show/:showId/seats — booked seats for a show
router.get('/show/:showId/seats', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT seats FROM bookings WHERE show_id = ? AND booking_status = 'confirmed'",
      [req.params.showId]
    );
    const bookedSeats = rows.flatMap(r => r.seats.split(','));
    res.json({ bookedSeats });
  } catch (err) { next(err); }
});

// POST /api/bookings/validate-coupon
router.post('/validate-coupon', authMiddleware, async (req, res, next) => {
  const { code, amount } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM coupons WHERE code = ? AND is_active = TRUE',
      [code]
    );
    if (!rows.length) return res.status(400).json({ message: 'Invalid or expired coupon' });
    const coupon = rows[0];
    if (amount < coupon.min_amount) {
      return res.status(400).json({ message: `Minimum booking amount is ₹${coupon.min_amount}` });
    }
    const discount = Math.min((amount * coupon.discount_percent) / 100, coupon.max_discount);
    res.json({ discount: Math.round(discount), description: coupon.description });
  } catch (err) { next(err); }
});

// POST /api/bookings — create booking
router.post('/', authMiddleware, async (req, res, next) => {
  const { show_id, seats, coupon_code, payment_method } = req.body;
  try {
    // Get show info
    const [shows] = await pool.execute(
      'SELECT s.*, m.title as movie_title, t.name as theatre_name FROM shows s JOIN movies m ON s.movie_id=m.id JOIN theatres t ON s.theatre_id=t.id WHERE s.id = ?',
      [show_id]
    );
    if (!shows.length) return res.status(404).json({ message: 'Show not found' });
    const show = shows[0];

    // Check seat availability
    const [existing] = await pool.execute(
      "SELECT seats FROM bookings WHERE show_id = ? AND booking_status = 'confirmed'",
      [show_id]
    );
    const bookedSeats = existing.flatMap(r => r.seats.split(','));
    const requestedSeats = seats.split(',').map(s => s.trim());
    const conflict = requestedSeats.some(s => bookedSeats.includes(s));
    if (conflict) return res.status(400).json({ message: 'One or more seats already booked' });

    // Calculate price — VIP seats are rows A-C
    const vipRows = ['A', 'B', 'C'];
    let total = 0;
    requestedSeats.forEach(seat => {
      const row = seat[0];
      total += vipRows.includes(row) ? parseFloat(show.price_vip) : parseFloat(show.price_regular);
    });

    // Apply coupon
    let discount = 0;
    let finalAmount = total;
    if (coupon_code) {
      const [coupons] = await pool.execute('SELECT * FROM coupons WHERE code = ? AND is_active = TRUE', [coupon_code]);
      if (coupons.length) {
        const coupon = coupons[0];
        if (total >= coupon.min_amount) {
          discount = Math.min((total * coupon.discount_percent) / 100, coupon.max_discount);
          finalAmount = total - discount;
        }
      }
    }

    const bookingCode = genBookingCode();
    const qrData = JSON.stringify({ code: bookingCode, show_id, seats: requestedSeats, user_id: req.user.id });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const [result] = await pool.execute(
      `INSERT INTO bookings (booking_code, user_id, show_id, seats, total_amount, discount_amount, final_amount, coupon_code, payment_status, booking_status, qr_code_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'confirmed', ?)`,
      [bookingCode, req.user.id, show_id, requestedSeats.join(','), total, discount, finalAmount, coupon_code || null, qrCodeUrl]
    );

    // Create notification
    await pool.execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [req.user.id, '🎬 Booking Confirmed!', `Your booking for ${show.movie_title} at ${show.theatre_name} on ${show.show_date} is confirmed. Code: ${bookingCode}`]
    );

    res.status(201).json({
      message: 'Booking confirmed',
      booking: {
        id: result.insertId,
        booking_code: bookingCode,
        seats: requestedSeats,
        total_amount: total,
        discount_amount: discount,
        final_amount: finalAmount,
        qr_code: qrCodeUrl,
        show
      }
    });
  } catch (err) { next(err); }
});

// GET /api/bookings/my — user booking history
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, m.title as movie_title, m.poster_url, t.name as theatre_name, t.city,
       s.show_date, s.show_time, s.price_regular, s.price_vip, sc.screen_name
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN theatres t ON s.theatre_id = t.id
       JOIN screens sc ON s.screen_id = sc.id
       WHERE b.user_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/bookings/:id — single booking detail
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, m.title as movie_title, m.poster_url, m.genre, m.language, m.duration_mins,
       t.name as theatre_name, t.city, t.location,
       s.show_date, s.show_time, sc.screen_name
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN movies m ON s.movie_id = m.id
       JOIN theatres t ON s.theatre_id = t.id
       JOIN screens sc ON s.screen_id = sc.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ? AND user_id = ? AND booking_status = 'confirmed'",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking not found or already cancelled' });
    await pool.execute(
      "UPDATE bookings SET booking_status = 'cancelled', payment_status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );
    // Notification
    await pool.execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [req.user.id, '❌ Booking Cancelled', `Booking ${rows[0].booking_code} has been cancelled. Refund will be processed within 3-5 business days.`]
    );
    res.json({ message: 'Booking cancelled' });
  } catch (err) { next(err); }
});

// GET /api/bookings/notifications/all
router.get('/notifications/all', authMiddleware, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PUT /api/bookings/notifications/read
router.put('/notifications/read', authMiddleware, async (req, res, next) => {
  try {
    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
});

module.exports = router;
