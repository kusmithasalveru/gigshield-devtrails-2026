const pool = require('../db/pool');

const FALLBACK_ZONES = [
  { id: 'z-demo-1', city: 'Hyderabad', grid_cell: 'Kukatpally', risk_score: 0.68, flood_frequency: 0.2, disruption_days_per_month: 6, lat: 17.493, lng: 78.399 },
  { id: 'z-demo-2', city: 'Hyderabad', grid_cell: 'Madhapur', risk_score: 0.52, flood_frequency: 0.1, disruption_days_per_month: 4, lat: 17.448, lng: 78.391 },
  { id: 'z-demo-3', city: 'Delhi', grid_cell: 'Saket', risk_score: 0.74, flood_frequency: 0.18, disruption_days_per_month: 7, lat: 28.524, lng: 77.206 },
];

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
  } catch (err) {
    // Demo-friendly fallback when DB isn't running locally.
    res.json(FALLBACK_ZONES);
  }
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
  } catch (err) {
    const z = FALLBACK_ZONES.find((x) => x.id === req.params.id);
    if (!z) return res.status(404).json({ error: 'Zone not found' });
    res.json(z);
  }
};
