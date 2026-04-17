import { useState, useEffect, useCallback } from 'react';

export default function useGeoLocation() {
  const [state, setState] = useState(() => {
    const cached = localStorage.getItem('gigshield_location');
    if (cached) {
      const { latitude, longitude } = JSON.parse(cached);
      return { latitude, longitude, error: null, loading: true };
    }
    return { latitude: null, longitude: null, error: null, loading: true };
  });

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem('gigshield_location', JSON.stringify({ latitude, longitude }));
        setState({ latitude, longitude, error: null, loading: false });
      },
      (err) => {
        setState(prev => ({ ...prev, error: err.message, loading: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...state, refresh };
}
