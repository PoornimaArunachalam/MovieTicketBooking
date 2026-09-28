// backend/routes/theatres.js
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// GET /api/theatres
router.get('/', async (req, res, next) => {
  const { city } = req.query;
  try {
    let query = 'SELECT * FROM theatres';
    const params = [];
    if (city) { query += ' WHERE city = ?'; params.push(city); }
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/theatres/:id
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM theatres WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Theatre not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/theatres/:id/screens
router.get('/:id/screens', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM screens WHERE theatre_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
