const pool = require('../db/pool');
const { calculatePremium } = require('../services/premium.service');

// POST /api/policies — Purchase weekly policy
exports.purchasePolicy = async (req, res, next) => {
  try {
    const { worker_id, tier } = req.body;
    if (!worker_id || !tier) {
      return res.status(400).json({ error: 'worker_id and tier required' });
    }

    // Fetch worker and zone data
    const workerResult = await pool.query(
      `SELECT w.*, z.risk_score FROM workers w JOIN zones z ON w.zone_id = z.id WHERE w.id = $1`,
      [worker_id]
    );
    if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
    const worker = workerResult.rows[0];

    // Check for existing active policy this week
    const existing = await pool.query(
      `SELECT id FROM policies WHERE worker_id = $1 AND status = 'active' AND end_date >= CURRENT_DATE`,
      [worker_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Active policy already exists for this week' });
    }

    // Calculate premium
    const pricing = calculatePremium({
      zoneRiskScore: parseFloat(worker.risk_score),
      tier,
      weeksActive: worker.weeks_active
    });

    // Create policy (week starts today, ends in 7 days)
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO policies (worker_id, tier, premium, coverage_limit, zone_risk_score, season_factor, loyalty_discount, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [worker_id, tier, pricing.premium, pricing.coverageLimit,
       pricing.breakdown.zoneRiskScore, pricing.breakdown.seasonFactor,
       pricing.breakdown.loyaltyDiscount, startDate, endDate]
    );

    // Increment weeks active
    await pool.query('UPDATE workers SET weeks_active = weeks_active + 1 WHERE id = $1', [worker_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

// GET /api/policies/premium-quote — Calculate premium without purchasing
exports.getPremiumQuote = async (req, res, next) => {
  try {
    const { worker_id, tier } = req.query;
    if (!worker_id || !tier) {
      return res.status(400).json({ error: 'worker_id and tier query params required' });
    }

    const workerResult = await pool.query(
      `SELECT w.weeks_active, z.risk_score FROM workers w JOIN zones z ON w.zone_id = z.id WHERE w.id = $1`,
      [worker_id]
    );
    if (workerResult.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });

    const worker = workerResult.rows[0];
    const pricing = calculatePremium({
      zoneRiskScore: parseFloat(worker.risk_score),
      tier,
      weeksActive: worker.weeks_active
    });

    res.json(pricing);
  } catch (err) { next(err); }
};

// GET /api/policies/:id
exports.getPolicy = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM policies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};
