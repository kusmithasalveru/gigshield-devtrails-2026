import { useState, useEffect } from 'react';
import { getActiveEvents } from '../api/client';
import { mockTriggers } from '../api/mockData';

export default function useTriggerFeed() {
  const [triggers, setTriggers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const rows = await getActiveEvents();
        if (cancelled) return;
        if (Array.isArray(rows) && rows.length > 0) {
          const normalized = rows.map((r) => ({
            id: r.id,
            eventType: r.event_type || r.eventType || 'heavy_rain',
            zone: r.grid_cell || r.city || 'Zone',
            severity: r.severity || 'MEDIUM',
            durationMinutes: r.duration_minutes || r.durationMinutes || 0,
            status: 'active',
            source: 'live',
          }));
          setTriggers(normalized);
          setConnected(true);
          return;
        }
      } catch {
        // fallback below
      }

      if (!cancelled) {
        setTriggers(mockTriggers);
        setConnected(false);
      }
    }

    poll();
    const interval = setInterval(poll, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      setConnected(false);
    };
  }, []);

  return { triggers, connected };
}
