import { useEffect, useState } from 'react';

const HYDERABAD = { lat: 17.385, lng: 78.4867 };

export default function useIntegrationSignals() {
  const [signals, setSignals] = useState({
    loading: true,
    weather: null,
    traffic: null,
    platform: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${HYDERABAD.lat}&longitude=${HYDERABAD.lng}&current=temperature_2m,precipitation,wind_speed_10m`
        );
        const weatherJson = await weatherRes.json();
        if (cancelled) return;
        setSignals({
          loading: false,
          weather: weatherJson?.current || null,
          // Traffic + platform API are mock-safe integration placeholders by design.
          traffic: { congestion_index: 58, source: 'simulated' },
          platform: { delivery_api_status: 'operational', source: 'simulated' },
        });
      } catch {
        if (!cancelled) {
          setSignals({
            loading: false,
            weather: null,
            traffic: { congestion_index: 58, source: 'simulated' },
            platform: { delivery_api_status: 'operational', source: 'simulated' },
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return signals;
}
