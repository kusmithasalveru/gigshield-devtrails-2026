const pool = require('../db/pool');

// GET /api/zones — List all zones
exports.listZones = async (req, res, next) => {
  try {
    const { city } = req.query;
    let query = `SELECT id, city, grid_cell, risk_score, flood_frequency, disruption_days_per_month,
                        ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
                 FROM zones`;
    const params = [];
    if (city) { query += ' WHERE city = $1'; params.push(city); }
    query += ' ORDER BY city, grid_cell';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};

// GET /api/zones/:id
exports.getZoneById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT *, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
       FROM zones WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Zone not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
