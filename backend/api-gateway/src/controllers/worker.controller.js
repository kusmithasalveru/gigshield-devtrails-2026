const pool = require('../db/pool');

// POST /api/workers — Register new worker
exports.register = async (req, res, next) => {
  try {
    const { name, phone, language, platform, zone_id, upi_id, avg_weekly_earnings } = req.body;

    if (!name || !phone || !platform || !zone_id || !upi_id) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, platform, zone_id, upi_id' });
    }

    const result = await pool.query(
      `INSERT INTO workers (name, phone, language, platform, zone_id, upi_id, avg_weekly_earnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, phone, language || 'en', platform, zone_id, upi_id, avg_weekly_earnings || 4000]
    );

    // Log initial trust score
    await pool.query(
      'INSERT INTO trust_score_log (worker_id, action, score_change, new_score) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, 'Account created', 0, 50]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Phone number already registered' });
    next(err);
  }
};

// GET /api/workers/:id — Get worker profile
exports.getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT w.*, z.city, z.grid_cell, z.risk_score as zone_risk_score,
              ST_Y(z.location::geometry) as zone_lat, ST_X(z.location::geometry) as zone_lng
       FROM workers w JOIN zones z ON w.zone_id = z.id
       WHERE w.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// PATCH /api/workers/:id — Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'language', 'platform', 'zone_id', 'upi_id', 'avg_weekly_earnings'];
    const updates = [];
    const values = [];
    let paramIdx = 1;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIdx}`);
        values.push(req.body[field]);
        paramIdx++;
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);

    const result = await pool.query(
      `UPDATE workers SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// GET /api/workers/:id/trust-score — Trust score with history
exports.getTrustScore = async (req, res, next) => {
  try {
    const worker = await pool.query('SELECT trust_score FROM workers WHERE id = $1', [req.params.id]);
    if (worker.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

    const history = await pool.query(
      'SELECT action, score_change, new_score, created_at FROM trust_score_log WHERE worker_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.params.id]
    );

    res.json({
      currentScore: worker.rows[0].trust_score,
      history: history.rows
    });
  } catch (err) { next(err); }
};
