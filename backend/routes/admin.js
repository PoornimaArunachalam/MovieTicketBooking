// backend/routes/admin.js
const express = require('express');
const pool = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// ---- DASHBOARD STATS ----
router.get('/stats', async (req, res, next) => {
  try {
    const [[{ totalMovies }]] = await pool.execute('SELECT COUNT(*) as totalMovies FROM movies');
    const [[{ totalUsers }]] = await pool.execute('SELECT COUNT(*) as totalUsers FROM users WHERE role="user"');
    const [[{ totalBookings }]] = await pool.execute("SELECT COUNT(*) as totalBookings FROM bookings WHERE booking_status='confirmed'");
    const [[{ totalRevenue }]] = await pool.execute("SELECT COALESCE(SUM(final_amount),0) as totalRevenue FROM bookings WHERE booking_status='confirmed'");
    const [[{ totalTheatres }]] = await pool.execute('SELECT COUNT(*) as totalTheatres FROM theatres');
    const [recentBookings] = await pool.execute(
      `SELECT b.booking_code, b.seats, b.final_amount, b.created_at, u.name as user_name, m.title as movie_title
       FROM bookings b JOIN users u ON b.user_id=u.id JOIN shows s ON b.show_id=s.id JOIN movies m ON s.movie_id=m.id
       ORDER BY b.created_at DESC LIMIT 5`
    );
    res.json({ totalMovies, totalUsers, totalBookings, totalRevenue, totalTheatres, recentBookings });
  } catch (err) { next(err); }
});

// ---- MOVIES CRUD ----
router.get('/movies', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM movies ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/movies', async (req, res, next) => {
  const { title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, status } = req.body;
  try {
    await pool.execute(
      'INSERT INTO movies (title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, status) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, status || 'now_showing']
    );
    res.status(201).json({ message: 'Movie added' });
  } catch (err) { next(err); }
});

router.put('/movies/:id', async (req, res, next) => {
  const { title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, status } = req.body;
  try {
    await pool.execute(
      'UPDATE movies SET title=?,description=?,genre=?,language=?,duration_mins=?,rating=?,poster_url=?,banner_url=?,release_date=?,status=? WHERE id=?',
      [title, description, genre, language, duration_mins, rating, poster_url, banner_url, release_date, status, req.params.id]
    );
    res.json({ message: 'Movie updated' });
  } catch (err) { next(err); }
});

router.delete('/movies/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM movies WHERE id=?', [req.params.id]);
    res.json({ message: 'Movie deleted' });
  } catch (err) { next(err); }
});

// ---- THEATRES CRUD ----
router.get('/theatres', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM theatres ORDER BY city');
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/theatres', async (req, res, next) => {
  const { name, city, location, facilities } = req.body;
  try {
    await pool.execute('INSERT INTO theatres (name, city, location, facilities) VALUES (?,?,?,?)', [name, city, location, facilities]);
    res.status(201).json({ message: 'Theatre added' });
  } catch (err) { next(err); }
});

router.put('/theatres/:id', async (req, res, next) => {
  const { name, city, location, facilities } = req.body;
  try {
    await pool.execute('UPDATE theatres SET name=?,city=?,location=?,facilities=? WHERE id=?', [name, city, location, facilities, req.params.id]);
    res.json({ message: 'Theatre updated' });
  } catch (err) { next(err); }
});

router.delete('/theatres/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM theatres WHERE id=?', [req.params.id]);
    res.json({ message: 'Theatre deleted' });
  } catch (err) { next(err); }
});

// ---- SHOWS CRUD ----
router.get('/shows', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, m.title as movie_title, t.name as theatre_name, sc.screen_name
       FROM shows s JOIN movies m ON s.movie_id=m.id JOIN theatres t ON s.theatre_id=t.id JOIN screens sc ON s.screen_id=sc.id
       ORDER BY s.show_date DESC, s.show_time`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/shows', async (req, res, next) => {
  const { movie_id, theatre_id, screen_id, show_date, show_time, price_regular, price_vip } = req.body;
  try {
    await pool.execute(
      'INSERT INTO shows (movie_id, theatre_id, screen_id, show_date, show_time, price_regular, price_vip) VALUES (?,?,?,?,?,?,?)',
      [movie_id, theatre_id, screen_id, show_date, show_time, price_regular, price_vip]
    );
    res.status(201).json({ message: 'Show added' });
  } catch (err) { next(err); }
});

router.delete('/shows/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM shows WHERE id=?', [req.params.id]);
    res.json({ message: 'Show deleted' });
  } catch (err) { next(err); }
});

// ---- USERS ----
router.get('/users', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

// ---- BOOKINGS ----
router.get('/bookings', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.*, u.name as user_name, u.email as user_email, m.title as movie_title,
       t.name as theatre_name, s.show_date, s.show_time
       FROM bookings b JOIN users u ON b.user_id=u.id JOIN shows s ON b.show_id=s.id
       JOIN movies m ON s.movie_id=m.id JOIN theatres t ON s.theatre_id=t.id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ---- REVENUE REPORT ----
router.get('/revenue', async (req, res, next) => {
  try {
    const [monthly] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(final_amount) as revenue, COUNT(*) as bookings
       FROM bookings WHERE booking_status='confirmed'
       GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    const [byMovie] = await pool.execute(
      `SELECT m.title, COUNT(b.id) as bookings, SUM(b.final_amount) as revenue
       FROM bookings b JOIN shows s ON b.show_id=s.id JOIN movies m ON s.movie_id=m.id
       WHERE b.booking_status='confirmed'
       GROUP BY m.id ORDER BY revenue DESC LIMIT 10`
    );
    res.json({ monthly, byMovie });
  } catch (err) { next(err); }
});

// ---- SCREENS CRUD ----
router.get('/screens', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT sc.*, t.name as theatre_name FROM screens sc JOIN theatres t ON sc.theatre_id=t.id ORDER BY t.name'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/screens', async (req, res, next) => {
  const { theatre_id, screen_name, total_seats } = req.body;
  try {
    await pool.execute('INSERT INTO screens (theatre_id, screen_name, total_seats) VALUES (?,?,?)', [theatre_id, screen_name, total_seats]);
    res.status(201).json({ message: 'Screen added' });
  } catch (err) { next(err); }
});

router.delete('/screens/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM screens WHERE id=?', [req.params.id]);
    res.json({ message: 'Screen deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
