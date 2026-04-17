import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Fingerprint, Gauge, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import useGeoLocation from '../hooks/useGeoLocation';
import { getHealth, scoreFraud } from '../api/mlApi';
import { pushFraudCheck } from '../utils/sessionStore';
import { applyTrustPenalty, getTrustPenalty } from '../utils/trustScore';

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
  const { user, addToast, updateUser } = useAuth();
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
      pushFraudCheck(res);
      const penalty = getTrustPenalty({ decision: res?.decision, anomalyScore: res?.anomaly_score });
      if (penalty > 0) {
        const nextTrustScore = applyTrustPenalty(user?.trustScore, penalty);
        updateUser({ trustScore: nextTrustScore });
      }
      addToast('success', t('common.confirm'));
    } catch (e) {
      setSimulated(true);
      setErrMsg(e?.message || 'API failed');
      const fallback = {
        anomaly_score: 0.66,
        decision: 'human_review',
        flags: ['Simulated Response (API failed)'],
        shap_explanation: null,
      };
      setResp(fallback);
      const penalty = getTrustPenalty({ decision: fallback.decision, anomalyScore: fallback.anomaly_score });
      if (penalty > 0) {
        const nextTrustScore = applyTrustPenalty(user?.trustScore, penalty);
        updateUser({ trustScore: nextTrustScore });
      }
      addToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('claims.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI Decision Engine</p>
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
            API {apiOk === null ? t('common.loading') : apiOk ? 'OK' : t('common.error')}
          </span>
        </div>
      </div>

      {geoError && (
        <div className="card text-amber-800 bg-amber-50 border-amber-100 text-sm">
          Geolocation unavailable: {geoError}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2">
          <Fingerprint size={18} className="text-primary-700" />
          <p className="font-semibold">{t('claims.title')}</p>
          <span className="inline-flex items-center gap-1 text-xs rounded-full bg-indigo-100 text-indigo-700 px-2 py-1">
            <Sparkles size={12} /> AI Decision Engine
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-600">Worker ID</label>
          <input
            value={form.worker_id}
            onChange={(e) => setForm((p) => ({ ...p, worker_id: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
            placeholder="worker_id"
          />

          <label className="text-sm text-gray-600">Event ID</label>
          <input
            value={form.event_id}
            onChange={(e) => setForm((p) => ({ ...p, event_id: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
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
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
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
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            className="w-full rounded-xl py-3 border border-slate-200 dark:border-slate-700"
          >
            <MapPin size={16} />
            {t('common.confirm')}
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
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Claims (30d)</label>
            <input
              type="number"
              value={form.claims_past_30d}
              onChange={(e) => setForm((p) => ({ ...p, claims_past_30d: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Claim ratio</label>
            <input
              type="number"
              step="0.01"
              value={form.claim_to_coverage_ratio}
              onChange={(e) => setForm((p) => ({ ...p, claim_to_coverage_ratio: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Earnings match</label>
            <input
              type="number"
              step="0.01"
              value={form.earnings_match_score}
              onChange={(e) => setForm((p) => ({ ...p, earnings_match_score: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 outline-none border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      <button onClick={submit} disabled={loading} className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-3 flex items-center justify-center gap-2">
        <Gauge size={18} />
        {loading ? t('common.loading') : 'Score Fraud'}
      </button>

      {resp && (
        <div className="space-y-3">
          {simulated && <div className="text-sm text-amber-800 font-semibold">Simulated Response</div>}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-4 ${decisionTone} flex items-center justify-between gap-3`}>
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
          </motion.div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Anomaly Score</p>
              <p className="font-bold">{Math.round(Number(resp.anomaly_score || 0) * 100)}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" style={{ width: `${Math.round(Number(resp.anomaly_score || 0) * 100)}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4">
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
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 text-sm text-slate-500 dark:text-slate-400">
          Enter claim input and click <b>Score Fraud</b> to run the AI Decision Engine.
        </div>
      )}
    </div>
  );
}

