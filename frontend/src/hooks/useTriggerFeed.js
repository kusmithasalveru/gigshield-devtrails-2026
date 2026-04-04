import { useState, useEffect } from 'react';
import { mockTriggers } from '../api/mockData';

export default function useTriggerFeed() {
  const [triggers, setTriggers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection with mock data
    const timer = setTimeout(() => {
      setTriggers(mockTriggers);
      setConnected(true);
    }, 500);

    // Simulate periodic updates — new triggers or duration changes
    const interval = setInterval(() => {
      setTriggers(prev =>
        prev.map(t => ({
          ...t,
          durationMinutes: t.durationMinutes + 15
        }))
      );
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      setConnected(false);
    };

    // In production, replace with:
    // const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'wss://api.gigshield.in/triggers');
    // ws.onmessage = (event) => setTriggers(JSON.parse(event.data));
    // ws.onopen = () => setConnected(true);
    // ws.onclose = () => setConnected(false);
    // return () => ws.close();
  }, []);

  return { triggers, connected };
}
