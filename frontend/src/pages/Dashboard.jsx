import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Sparkles, Timer, Shield, Activity, Wallet } from 'lucide-react';
import { useAuth } from '../App';
import { getDashboardWorker } from '../api/mlApi';

function riskBadge(score) {
  const s = Number(score || 0);
  if (s >= 70) return { label: `High (${s})`, cls: 'bg-amber-100 text-amber-800' };
  if (s >= 35) return { label: `Medium (${s})`, cls: 'bg-amber-100 text-amber-700' };
  return { label: `Low (${s})`, cls: 'bg-green-100 text-green-700' };
}

function MiniChart({ series }) {
  const points = Array.isArray(series) ? series : [];
  const values = points.map((p) => Number(p.value)).filter((v) => Number.isFinite(v));
  const max = Math.max(1, ...values);
  return (
    <div className="mt-3">
      <div className="flex items-end gap-1 h-14">
        {points.map((p, idx) => {
          const v = Number(p.value);
          const h = Math.round((v / max) * 56);
          const isLast = idx === points.length - 1;
          return (
            <div key={`${p.label}-${idx}`} className="flex-1 rounded-lg bg-primary-100 relative">
              <div
                className={`absolute inset-x-1 bottom-1 rounded-lg ${isLast ? 'bg-primary-600' : 'bg-primary-600/70'}`}
                style={{ height: `${Math.max(6, h)}px`, opacity: isLast ? 1 : 0.9 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-gray-400">
        <span>{points?.[0]?.label || 'R1'}</span>
        <span>{points?.[points.length - 1]?.label || 'Latest'}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const res = await getDashboardWorker(user?.id);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) {
          setData({
            simulated: true,
            earnings_protected: 280,
            active_coverage: true,
            claim_status: { total: 5, completed: 3, held: 2 },
            risk_score: 41,
            risk_score_series: [
              { label: 'R1', value: 34 },
              { label: 'R2', value: 38 },
              { label: 'R3', value: 41 },
              { label: 'R4', value: 39 },
            ],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const badge = useMemo(() => riskBadge(data?.risk_score), [data?.risk_score]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">
            {t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Worker' })}
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered parametric payouts for gig workers.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              <Sparkles size={14} /> AI Powered
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              <Timer size={14} /> Auto Claim Enabled
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              <ShieldCheck size={14} /> Instant Payout
            </span>
          </div>
        </div>
      </div>

      {data?.simulated && (
        <div className="card text-sm text-amber-800 bg-amber-50 border-amber-100">
          Simulated Response (API failed)
        </div>
      )}

      {/* Earnings Protected */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Wallet size={22} className="text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-700">Earnings Protected</p>
              <p className="text-2xl font-bold text-primary-800">₹{Number(data?.earnings_protected || 0).toFixed(0)}</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700">
            Phase 3
          </span>
        </div>
      </div>

      {/* Coverage + Claims */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Active Coverage</p>
              <p className="text-xs text-gray-500 mt-1">Policy validity</p>
            </div>
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full ${
                data?.active_coverage ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {data?.active_coverage ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Claim Status</p>
              <p className="text-xs text-gray-500 mt-1">Completed / Held</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700">
              {(data?.claim_status?.completed ?? 0)}/{data?.claim_status?.total ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Risk */}
      <div className="card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Shield size={22} className="text-primary-700" />
            </div>
            <div>
              <p className="text-sm font-semibold">Risk Score</p>
              <p className="text-xs text-gray-500 mt-1">AI-based fraud likelihood</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <MiniChart series={data?.risk_score_series} />
      </div>

      <div className="card flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Activity size={18} className="text-green-700" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Decision Engine</p>
            <p className="text-xs text-gray-500">Event → Validation → Decision → Payout</p>
          </div>
        </div>
        <button onClick={() => navigate('/fraud')} className="btn-primary">
          Test AI
        </button>
      </div>
    </div>
  );
}
