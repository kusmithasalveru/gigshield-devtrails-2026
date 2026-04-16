import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import useGeoLocation from '../hooks/useGeoLocation';
import { getHealth, processPayout } from '../api/mlApi';
import { Wallet, MapPin, ShieldCheck, Bolt, Loader, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function PayoutHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { latitude, longitude, refresh, error: geoError } = useGeoLocation();

  const [apiOk, setApiOk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [resp, setResp] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const [form, setForm] = useState(() => ({
    worker_id: user?.id || '',
    event_id: crypto.randomUUID ? crypto.randomUUID() : `evt-${Date.now()}`,
    gps_lat: latitude ?? 0,
    gps_lng: longitude ?? 0,
  }));

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      worker_id: user?.id || prev.worker_id,
      gps_lat: latitude ?? prev.gps_lat,
      gps_lng: longitude ?? prev.gps_lng,
    }));
  }, [user?.id, latitude, longitude]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await getHealth();
        if (!cancelled) setApiOk(true);
      } catch {
        if (!cancelled) setApiOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tone = useMemo(() => {
    const status = resp?.status;
    if (status === 'completed') return 'border-green-100 bg-green-50 text-green-700';
    if (status === 'held') return 'border-amber-100 bg-amber-50 text-amber-800';
    return 'border-amber-100 bg-amber-50 text-amber-800';
  }, [resp?.status]);

  const message = useMemo(() => {
    if (!resp) return '';
    if (resp.status === 'completed') {
      const ref = resp.razorpay_ref ? ` Ref: ${resp.razorpay_ref}` : '';
      return `Payout completed. ₹${resp.amount}${ref}`;
    }
    return `Payout held. Fraud decision: ${resp.fraud_decision}.`;
  }, [resp]);

  const submit = async () => {
    setLoading(true);
    setSimulated(false);
    setErrMsg('');
    setResp(null);

    try {
      const res = await processPayout({
        worker_id: form.worker_id,
        event_id: form.event_id,
        gps_lat: Number(form.gps_lat),
        gps_lng: Number(form.gps_lng),
      });
      setResp(res);
    } catch (e) {
      setSimulated(true);
      setErrMsg(e?.message || 'API failed');
      setResp({
        payout_id: 'sim-pay-001',
        amount: 140,
        status: 'held',
        fraud_decision: 'human_review',
        fraud_score: 0.62,
        razorpay_ref: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{t('payouts.title') || 'Payout'}</h1>
          <p className="text-sm text-gray-500 mt-1">Instant Payout</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 text-[11px] font-semibold px-3 py-1 rounded-full border ${
            apiOk === null
              ? 'bg-primary-50 text-primary-700 border-primary-100'
              : apiOk
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-amber-50 text-amber-800 border-amber-100'
          }`}
        >
          <ShieldCheck size={14} />
          API {apiOk === null ? 'Checking...' : apiOk ? 'OK' : 'Failed'}
        </span>
      </div>

      {geoError && (
        <div className="card text-amber-800 bg-amber-50 border-amber-100 text-sm">
          Geolocation unavailable: {geoError}
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-primary-700" />
          <p className="font-semibold">Payout Input</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-600">Worker ID</label>
          <input
            value={form.worker_id}
            onChange={(e) => setForm((p) => ({ ...p, worker_id: e.target.value }))}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            placeholder="worker_id"
          />

          <label className="text-sm text-gray-600">Event ID</label>
          <input
            value={form.event_id}
            onChange={(e) => setForm((p) => ({ ...p, event_id: e.target.value }))}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            placeholder="event_id"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={14} />
                GPS Lat
              </label>
              <input
                type="number"
                value={form.gps_lat}
                onChange={(e) => setForm((p) => ({ ...p, gps_lat: e.target.value }))}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin size={14} />
                GPS Lng
              </label>
              <input
                type="number"
                value={form.gps_lng}
                onChange={(e) => setForm((p) => ({ ...p, gps_lng: e.target.value }))}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
              />
            </div>
          </div>

          <button type="button" onClick={() => refresh()} className="btn-secondary w-full flex items-center justify-center gap-2">
            <MapPin size={16} />
            Use current GPS
          </button>
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? <Loader size={18} className="animate-spin" /> : <Bolt size={18} />}
        {loading ? 'Processing...' : 'Process Payout'}
      </button>

      {simulated && <div className="text-sm text-amber-800 font-semibold">Simulated Response</div>}
      {errMsg && simulated && <div className="text-sm text-amber-900/80">{errMsg}</div>}

      {resp && (
        <div className="space-y-3">
          <div className={`card border ${tone}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {resp.status === 'completed' ? (
                  <CheckCircle2 size={18} className="text-green-700" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-700" />
                )}
                <div>
                  <p className="text-sm font-semibold">Result</p>
                  <p className="text-xs text-gray-500">Status: {resp.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₹{Number(resp.amount || 0)}</p>
                <p className="text-[11px] text-gray-500 mt-1">Payout ID: {resp.payout_id}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <p className="font-semibold text-sm">Message</p>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                Fraud decision: {resp.fraud_decision}
              </span>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                Fraud score: {Number(resp.fraud_score || 0).toFixed(3)}
              </span>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                UPI ref: {resp.razorpay_ref || 'mock'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
