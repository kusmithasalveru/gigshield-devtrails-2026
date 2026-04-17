const crypto = require('crypto');

/**
 * Generate deduplication hash for disruption events.
 * One unique event per zone + type + hour window.
 */
function generateEventHash(zoneId, eventType, timestamp = new Date()) {
  const date = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
  const hourBucket = timestamp.getUTCHours();
  const input = `${zoneId}:${eventType}:${date}:${hourBucket}`;
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = { generateEventHash };
