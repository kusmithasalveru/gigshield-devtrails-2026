const pool = require('../db/pool');

// GET /api/payouts/:id
exports.getPayoutById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*, de.event_type, de.severity, de.trigger_data, de.duration_minutes,
              z.city, z.grid_cell
       FROM payouts p
       JOIN disruption_events de ON p.event_id = de.id
       JOIN zones z ON de.zone_id = z.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payout not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// POST /api/payouts/:id/dispute
exports.initiateDispute = async (req, res, next) => {
  try {
    const { reason, voice_note_url } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason is required' });

    // Verify payout exists and is held
    const payout = await pool.query('SELECT * FROM payouts WHERE id = $1', [req.params.id]);
    if (payout.rows.length === 0) return res.status(404).json({ error: 'Payout not found' });

    const result = await pool.query(
      `INSERT INTO disputes (payout_id, worker_id, reason, voice_note_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, payout.rows[0].worker_id, reason, voice_note_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};
