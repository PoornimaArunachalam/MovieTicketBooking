// backend/routes/movies.js
const express = require('express');
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET /api/movies — list with search/filter
router.get('/', async (req, res, next) => {
  const { search, genre, language, status, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM movies WHERE 1=1';
  const params = [];
  if (search) { query += ' AND title LIKE ?'; params.push(`%${search}%`); }
  if (genre) { query += ' AND genre LIKE ?'; params.push(`%${genre}%`); }
  if (language) { query += ' AND language = ?'; params.push(language); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  try {
    const [rows] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM movies WHERE 1=1');
    res.json({ movies: rows, total });
  } catch (err) { next(err); }
});

// GET /api/movies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Movie not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/movies/:id/shows — grouped by theatre
router.get('/:id/shows', async (req, res, next) => {
  const { date } = req.query;
  try {
    const showDate = date || new Date().toISOString().split('T')[0];
    const [rows] = await pool.execute(
      `SELECT s.*, t.name as theatre_name, t.city, t.location, t.facilities, sc.screen_name
       FROM shows s
       JOIN theatres t ON s.theatre_id = t.id
       JOIN screens sc ON s.screen_id = sc.id
       WHERE s.movie_id = ? AND s.show_date = ?
       ORDER BY t.name, s.show_time`,
      [req.params.id, showDate]
    );
    // Group by theatre
    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.theatre_id]) {
        grouped[r.theatre_id] = {
          theatre_id: r.theatre_id,
          theatre_name: r.theatre_name,
          city: r.city,
          location: r.location,
          facilities: r.facilities,
          shows: []
        };
      }
      grouped[r.theatre_id].shows.push({
        id: r.id, show_time: r.show_time, screen_name: r.screen_name,
        price_regular: r.price_regular, price_vip: r.price_vip, show_date: r.show_date
      });
    });
    res.json(Object.values(grouped));
  } catch (err) { next(err); }
});

// GET /api/movies/:id/reviews
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews WHERE movie_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/movies/:id/reviews
router.post('/:id/reviews', authMiddleware, async (req, res, next) => {
  const { rating, comment } = req.body;
  try {
    const [user] = await pool.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
    await pool.execute(
      'INSERT INTO reviews (movie_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.user.id, user[0].name, rating, comment]
    );
    // Update avg rating
    await pool.execute(
      'UPDATE movies SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE movie_id = ?) WHERE id = ?',
      [req.params.id, req.params.id]
    );
    res.status(201).json({ message: 'Review posted' });
  } catch (err) { next(err); }
});

module.exports = router;
