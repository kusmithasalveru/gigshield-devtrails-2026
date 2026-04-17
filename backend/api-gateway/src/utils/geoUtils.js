/**
 * Haversine formula — distance between two lat/lng points in kilometers.
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) { return deg * (Math.PI / 180); }

/**
 * Check if a point is within radius (km) of a center point.
 */
function isWithinRadius(lat, lng, centerLat, centerLng, radiusKm) {
  return haversineDistance(lat, lng, centerLat, centerLng) <= radiusKm;
}

module.exports = { haversineDistance, isWithinRadius };
