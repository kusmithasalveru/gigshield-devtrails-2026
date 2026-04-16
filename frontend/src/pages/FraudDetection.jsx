import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, MapPin, Fingerprint, Gauge, AlertTriangle } from 'lucide-react';
import { useAuth } from '../App';
import useGeoLocation from '../hooks/useGeoLocation';
import { getHealth, scoreFraud } from '../api/mlApi';

function FlagBadge({ flag }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-1 bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-semibold">
      {flag}
    </span>
  );
}

function SimulatedBox({ title, payload }) {
  return (
    <div className="card bg-amber-50 border-amber-100">
      <p className="text-amber-800 font-semibold text-sm">{title}</p>
      <pre className="mt-2 text-[12px] text-amber-900/80 whitespace-pre-wrap break-words">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

export default function FraudDetection() {
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
    last_activity_hours_ago: 0.5,
    claims_past_30d: 1,
    claim_to_coverage_ratio: 0.3,
    earnings_match_score: 0.85,
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

  const decisionTone = useMemo(() => {
    const d = resp?.decision;
    if (!d) return 'bg-primary-50 text-primary-700';
    if (d === 'auto_approve') return 'bg-green-50 text-green-700 border border-green-100';
    if (d === 'human_review') return 'bg-amber-50 text-amber-800 border border-amber-100';
    if (d === 'hold') return 'bg-amber-50 text-amber-800 border border-amber-100';
    return 'bg-amber-50 text-amber-800 border border-amber-100';
  }, [resp?.decision]);

  const submit = async () => {
    setLoading(true);
    setSimulated(false);
    setErrMsg('');
    setResp(null);

    try {
      const res = await scoreFraud({
        worker_id: form.worker_id,
        event_id: form.event_id,
        gps_lat: Number(form.gps_lat),
        gps_lng: Number(form.gps_lng),
        last_activity_hours_ago: Number(form.last_activity_hours_ago),
        claims_past_30d: Number(form.claims_past_30d),
        claim_to_coverage_ratio: Number(form.claim_to_coverage_ratio),
        earnings_match_score: Number(form.earnings_match_score),
      });
      setResp(res);
    } catch (e) {
      setSimulated(true);
      setErrMsg(e?.message || 'API failed');
      setResp({
        anomaly_score: 0.66,
        decision: 'human_review',
        flags: ['Simulated Response (API failed)'],
        shap_explanation: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Fraud Detection</h1>
          <p className="text-sm text-gray-500 mt-1">AI Decision Engine</p>
        </div>
        <div className="flex flex-col items-end gap-2">
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
      </div>

      {geoError && (
        <div className="card text-amber-800 bg-amber-50 border-amber-100 text-sm">
          Geolocation unavailable: {geoError}
        </div>
      )}

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Fingerprint size={18} className="text-primary-700" />
          <p className="font-semibold">Claim Input</p>
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

          <button
            type="button"
            onClick={() => refresh()}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <MapPin size={16} />
            Use current GPS
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Last active (hrs ago)</label>
            <input
              type="number"
              step="0.1"
              value={form.last_activity_hours_ago}
              onChange={(e) => setForm((p) => ({ ...p, last_activity_hours_ago: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Claims (30d)</label>
            <input
              type="number"
              value={form.claims_past_30d}
              onChange={(e) => setForm((p) => ({ ...p, claims_past_30d: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Claim ratio</label>
            <input
              type="number"
              step="0.01"
              value={form.claim_to_coverage_ratio}
              onChange={(e) => setForm((p) => ({ ...p, claim_to_coverage_ratio: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Earnings match</label>
            <input
              type="number"
              step="0.01"
              value={form.earnings_match_score}
              onChange={(e) => setForm((p) => ({ ...p, earnings_match_score: e.target.value }))}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-500 border border-gray-100"
            />
          </div>
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
        <Gauge size={18} />
        {loading ? 'Running AI...' : 'Score Fraud'}
      </button>

      {resp && (
        <div className="space-y-3">
          {simulated && <div className="text-sm text-amber-800 font-semibold">Simulated Response</div>}

          <div className={`card ${decisionTone} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2">
              <Gauge size={18} />
              <div>
                <p className="text-xs font-semibold opacity-90">Anomaly score</p>
                <p className="text-lg font-bold">{Number(resp.anomaly_score ?? 0).toFixed(3)}</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/40 border border-white/40">
              Decision: {resp.decision}
            </span>
          </div>

          <div className="card">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-700" />
              <p className="font-semibold">Flags</p>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {(resp.flags && resp.flags.length > 0 ? resp.flags : []).map((f, idx) => (
                <FlagBadge key={`${f}-${idx}`} flag={f} />
              ))}
              {(!resp.flags || resp.flags.length === 0) && (
                <span className="text-sm text-green-700 font-semibold bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                  No flags
                </span>
              )}
            </div>
            {simulated && errMsg && <p className="mt-2 text-sm text-amber-900/80">{errMsg}</p>}
          </div>
        </div>
      )}

      {!resp && (
        <div className="card text-sm text-gray-500">
          Enter claim input and click <b>Score Fraud</b> to run the AI Decision Engine.
        </div>
      )}
    </div>
  );
}

