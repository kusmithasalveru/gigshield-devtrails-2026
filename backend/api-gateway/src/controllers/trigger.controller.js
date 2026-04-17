const pool = require('../db/pool');

const FALLBACK_EVENTS = [
  {
    id: 'evt-demo-1',
    zone_id: 'z-demo-1',
    event_type: 'heavy_rain',
    severity: 'HIGH',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    trigger_data: { source: 'simulated', precipitation_mm: 18 },
    city: 'Hyderabad',
    grid_cell: 'Kukatpally',
  },
];

// GET /api/events — List disruption events with filters
exports.listEvents = async (req, res, next) => {
  try {
    const { zone_id, event_type, start_date, end_date, limit = 50 } = req.query;
    let query = 'SELECT de.*, z.city, z.grid_cell FROM disruption_events de JOIN zones z ON de.zone_id = z.id WHERE 1=1';
    const params = [];
    let idx = 1;

    if (zone_id) { query += ` AND de.zone_id = $${idx++}`; params.push(zone_id); }
    if (event_type) { query += ` AND de.event_type = $${idx++}`; params.push(event_type); }
    if (start_date) { query += ` AND de.start_time >= $${idx++}`; params.push(start_date); }
    if (end_date) { query += ` AND de.start_time <= $${idx++}`; params.push(end_date); }

    query += ` ORDER BY de.start_time DESC LIMIT $${idx}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    // Demo-friendly fallback when DB isn't running locally.
    res.json(FALLBACK_EVENTS);
  }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT de.*, z.city, z.grid_cell,
              ST_Y(z.location::geometry) as zone_lat, ST_X(z.location::geometry) as zone_lng
       FROM disruption_events de JOIN zones z ON de.zone_id = z.id
       WHERE de.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    const e = FALLBACK_EVENTS.find((x) => x.id === req.params.id);
    if (!e) return res.status(404).json({ error: 'Event not found' });
    res.json(e);
  }
};
