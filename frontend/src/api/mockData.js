export const mockUser = {
  id: 'u-ravi-001',
  name: 'Ravi Shankar',
  phone: '9876543210',
  language: 'te',
  platform: 'swiggy',
  zone: 'Kukatpally, Hyderabad',
  zoneLat: 17.4947,
  zoneLng: 78.3996,
  upiId: '9876543210@paytm',
  trustScore: 58,
  weeksActive: 8,
  avgWeeklyEarnings: 4500,
  createdAt: '2025-12-01T10:00:00Z'
};

export const mockPolicy = {
  id: 'p-001',
  workerId: 'u-ravi-001',
  tier: 'standard',
  premium: 30,
  coverageLimit: 350,
  weekStart: '2026-03-30',
  weekEnd: '2026-04-05',
  status: 'active',
  zoneRiskScore: 0.68,
  seasonFactor: 1.10,
  loyaltyDiscount: 0.95
};

export const mockTriggers = [
  {
    id: 'e-001',
    eventType: 'heavy_rain',
    severity: 'HIGH',
    zone: 'Kukatpally',
    triggerValue: 22.5,
    threshold: 15,
    unit: 'mm/hr',
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    durationMinutes: 45,
    status: 'active'
  },
  {
    id: 'e-002',
    eventType: 'severe_pollution',
    severity: 'HIGH',
    zone: 'Gachibowli',
    triggerValue: 340,
    threshold: 300,
    unit: 'AQI',
    startedAt: new Date(Date.now() - 150 * 60000).toISOString(),
    durationMinutes: 150,
    status: 'active'
  }
];

export const mockPayouts = [
  {
    id: 'pay-001',
    eventId: 'e-prev-001',
    eventType: 'heavy_rain',
    amount: 280,
    severity: 'HIGH',
    disruptedHours: 4,
    zone: 'Kukatpally',
    date: '2026-03-25T14:30:00Z',
    status: 'completed',
    description: 'Heavy rain (22mm/hr) for 4 hours'
  },
  {
    id: 'pay-002',
    eventId: 'e-prev-002',
    eventType: 'moderate_rain',
    amount: 84,
    severity: 'MEDIUM',
    disruptedHours: 2,
    zone: 'Kukatpally',
    date: '2026-03-20T16:00:00Z',
    status: 'completed',
    description: 'Moderate rain (12mm/hr) for 2 hours'
  },
  {
    id: 'pay-003',
    eventId: 'e-prev-003',
    eventType: 'severe_pollution',
    amount: 210,
    severity: 'HIGH',
    disruptedHours: 3,
    zone: 'HITEC City',
    date: '2026-03-15T08:00:00Z',
    status: 'completed',
    description: 'Severe AQI (350) for 3 hours'
  },
  {
    id: 'pay-004',
    eventId: 'e-prev-004',
    eventType: 'extreme_heat',
    amount: 56,
    severity: 'MEDIUM',
    disruptedHours: 2,
    zone: 'Kukatpally',
    date: '2026-03-10T12:00:00Z',
    status: 'completed',
    description: 'Extreme heat (46°C) for 2 hours'
  },
  {
    id: 'pay-005',
    eventId: 'e-prev-005',
    eventType: 'heavy_rain',
    amount: 140,
    severity: 'HIGH',
    disruptedHours: 2,
    zone: 'Kukatpally',
    date: '2026-03-02T17:00:00Z',
    status: 'held',
    description: 'Heavy rain (18mm/hr) for 2 hours — under review'
  }
];

export const mockPeerChoice = { basic: 15, standard: 62, pro: 23 };

export const mockDisputes = [
  {
    id: 'd-001',
    payoutId: 'pay-005',
    eventType: 'heavy_rain',
    amount: 140,
    status: 'under_review',
    submittedAt: '2026-03-03T09:00:00Z',
    reason: 'GPS error during storm, I was in Kukatpally zone',
    resolution: null
  }
];

export const mockTrustHistory = [
  { action: 'Successful validated claim', change: +2, newScore: 58, date: '2026-03-25' },
  { action: 'Four weeks continuous coverage', change: +3, newScore: 56, date: '2026-03-22' },
  { action: 'Anomaly flagged (not confirmed)', change: -3, newScore: 53, date: '2026-03-02' },
  { action: 'Successful validated claim', change: +2, newScore: 56, date: '2026-02-18' },
  { action: 'Account created', change: 0, newScore: 50, date: '2025-12-01' }
];
