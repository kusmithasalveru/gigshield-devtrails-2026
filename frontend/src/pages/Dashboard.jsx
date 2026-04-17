import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { ShieldCheck, Sparkles, Shield, Activity, Wallet, HandCoins } from 'lucide-react';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { getFraudChecks, getPayoutChecks } from '../utils/sessionStore';
import useIntegrationSignals from '../hooks/useIntegrationSignals';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const payouts = useMemo(() => getPayoutChecks(), []);
  const fraudChecks = useMemo(() => getFraudChecks(), []);
  const signals = useIntegrationSignals();
  const protectedIncome = payouts.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const riskScore = Math.round(((fraudChecks.at(-1)?.anomaly_score ?? 0.42) * 100));
  const weeklyCoverage = [
    { day: 'Mon', coverage: 65, protected: 35 },
    { day: 'Tue', coverage: 72, protected: 45 },
    { day: 'Wed', coverage: 55, protected: 30 },
    { day: 'Thu', coverage: 78, protected: 55 },
    { day: 'Fri', coverage: 82, protected: 62 },
    { day: 'Sat', coverage: 90, protected: 74 },
    { day: 'Sun', coverage: 84, protected: 66 },
  ];
  const trend = payouts.slice(-7).map((p, i) => ({ idx: `#${i + 1}`, value: Number(p.amount || 0) }));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl overflow-hidden relative min-h-[200px]">
        <img
          src="https://images.unsplash.com/photo-1609348954990-8c4d2bf2f00f?auto=format&fit=crop&w=1800&q=80"
          alt="Gig workers in city rain"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-800/80" />
        <div className="relative z-10 p-6 text-white">
          <p className="text-white/80">{t('dashboard.welcome', { name: user?.name?.split(' ')[0] || 'Worker' })}</p>
          <h1 className="text-2xl font-bold mt-1 break-words">{user?.name?.split(' ')[0] || t('dashboard.rider', { defaultValue: 'Rider' })}</h1>
          <p className="mt-3 text-white/85">{t('dashboard.heroLine', { defaultValue: 'AI + automation + instant payouts for weather-disrupted gigs.' })}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold">{t('dashboard.coverage')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('dashboard.apiLine', { defaultValue: 'Built on your existing fraud and payout APIs.' })}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              <Sparkles size={14} /> {t('dashboard.aiPowered', { defaultValue: 'AI Powered' })}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              <ShieldCheck size={14} /> {t('dashboard.instantPayout', { defaultValue: 'Instant Payout' })}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t('dashboard.totalEarned', { amount: protectedIncome }), value: `₹${protectedIncome}`, icon: Wallet },
          { label: t('common.covered'), value: 'ON', icon: ShieldCheck },
          { label: t('claims.status'), value: payouts.length > 0 ? t('claims.processing') : t('common.retry'), icon: Activity },
          { label: t('profile.trustScore'), value: `${riskScore}/100`, icon: HandCoins },
        ].map((item) => (
          <motion.div whileHover={{ scale: 1.02 }} key={item.label} className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 shadow-xl min-h-[122px]">
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/85 leading-snug break-words">{item.label}</p>
              <item.icon size={18} />
            </div>
            <p className="text-3xl font-bold mt-3 leading-none break-all">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{t('profile.trustScore')}</p>
          <p className="font-bold text-indigo-600">{riskScore}%</p>
        </div>
        <div className="mt-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-5 backdrop-blur-xl">
          <p className="font-semibold mb-4">{t('dashboard.totalEarned', { amount: protectedIncome })}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyCoverage}>
                <defs>
                  <linearGradient id="coverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="coverage" stroke="#4f46e5" fill="url(#coverGrad)" />
                <Area type="monotone" dataKey="protected" stroke="#06b6d4" fill="#06b6d433" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-5 backdrop-blur-xl">
          <p className="font-semibold mb-4">{t('dashboard.coverage')}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.length > 0 ? trend : [{ idx: t('common.noData', { defaultValue: 'No Data' }), value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="idx" />
                <YAxis />
                <Tooltip />
                <Line dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-5 backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <Activity size={22} className="text-indigo-700 dark:text-indigo-300" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold">{t('claims.title')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.orchestration', { defaultValue: 'Event detection, fraud scoring, and instant payout orchestration.' })}</p>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/fraud')} className="rounded-xl px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500">
          {t('dashboard.testAi', { defaultValue: 'Test AI' })}
        </button>
      </div>

      <button
        onClick={() => navigate('/admin')}
        className="w-full rounded-xl px-4 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
      >
        {t('dashboard.openAdmin', { defaultValue: 'Open Insurer Admin Dashboard' })}
      </button>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/70 p-4 backdrop-blur-xl">
        <p className="font-semibold mb-3">{t('dashboard.integrationStatus', { defaultValue: 'Integration Status' })}</p>
        {signals.loading ? (
          <div className="skeleton h-16" />
        ) : (
          <div className="space-y-2 text-sm">
            <p>Weather API: {signals.weather ? 'Live' : 'Unavailable'} {signals.weather ? `(Temp ${signals.weather.temperature_2m}°C)` : ''}</p>
            <p>Traffic Data: {signals.traffic?.source === 'simulated' ? 'Simulated Feed' : 'Live'}</p>
            <p>Platform API: {signals.platform?.delivery_api_status || 'simulated'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
