import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../App';
import LanguagePicker from '../components/LanguagePicker';
import { getFraudChecks, getPayoutChecks } from '../utils/sessionStore';
import { sendUserNotification } from '../api/client';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser, logout, addToast } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [stats, setStats] = useState({ risk_score: 42, claims: 0, completed: 0, held: 0 });

  const handleSave = (updates) => {
    updateUser(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const trustColor = user?.trustScore >= 60 ? 'text-green-600' : user?.trustScore >= 30 ? 'text-amber-600' : 'text-red-600';

  useEffect(() => {
    const fraud = getFraudChecks();
    const payouts = getPayoutChecks();
    setStats({
      risk_score: Math.round((fraud.at(-1)?.anomaly_score ?? 0.42) * 100),
      claims: payouts.length,
      completed: payouts.filter((p) => p.status === 'completed').length,
      held: payouts.filter((p) => p.status !== 'completed').length,
    });
  }, [user?.id]);

  const risk = useMemo(() => {
    const s = Number(stats?.risk_score ?? 0);
    if (s >= 70) return { label: t('profile.riskHigh', { defaultValue: 'High' }), cls: 'bg-amber-100 text-amber-800', bg: 'bg-amber-500' };
    if (s >= 35) return { label: t('profile.riskMedium', { defaultValue: 'Medium' }), cls: 'bg-amber-100 text-amber-700', bg: 'bg-amber-500' };
    return { label: t('profile.riskLow', { defaultValue: 'Low' }), cls: 'bg-green-100 text-green-700', bg: 'bg-green-500' };
  }, [stats?.risk_score, t]);

  const trustCircumference = 2 * Math.PI * 44;
  const trustProgress = ((user?.trustScore || 0) / 100) * trustCircumference;
  const latestAmount = useMemo(() => {
    const payouts = getPayoutChecks();
    return Number(payouts.at(-1)?.amount || 0);
  }, [stats.claims]);

  const buildAlertMessage = () => {
    const name = user?.name || 'Gig worker';
    const phone = user?.phone || '';
    return `GigShield Update for ${name} (${phone}): Latest available payout amount is Rs ${latestAmount}.`;
  };

  const triggerWhatsappAlert = async () => {
    const phone = (user?.phone || '').replace(/\D/g, '');
    if (!phone) {
      addToast?.('error', t('common.error'));
      return;
    }
    try {
      await sendUserNotification({
        phone,
        message: buildAlertMessage(),
        channel: 'whatsapp',
      });
      addToast?.('success', t('profile.whatsapp'));
    } catch (e) {
      addToast?.('error', e?.message || t('common.error'));
    }
  };

  const triggerSmsAlert = async () => {
    const phone = (user?.phone || '').replace(/\D/g, '');
    if (!phone) {
      addToast?.('error', t('common.error'));
      return;
    }
    try {
      await sendUserNotification({
        phone,
        message: buildAlertMessage(),
        channel: 'sms',
      });
      addToast?.('success', t('profile.sms'));
    } catch (e) {
      addToast?.('error', e?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('profile.title')}</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-center gap-2">
          <Check size={18} /> {t('profile.saved')}
        </div>
      )}

      {/* User Info */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
          <User size={28} className="text-primary-600" />
        </div>
        <div>
          <p className="font-bold text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">+91 {user?.phone} &middot; {user?.platform}</p>
        </div>
      </div>

      {/* Trust Score */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield size={18} className="text-primary-600" />
            {t('profile.trustScore')}
          </h3>
          <span className={`text-xl font-bold ${trustColor}`}>{user?.trustScore}/100</span>
        </div>
        <div className="flex items-center gap-6">
          <svg width="108" height="108" viewBox="0 0 108 108">
            <circle cx="54" cy="54" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="54"
              cy="54"
              r="44"
              fill="none"
              stroke="#22c55e"
              strokeWidth="10"
              strokeDasharray={`${trustProgress} ${trustCircumference}`}
              transform="rotate(-90 54 54)"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.trustConsistency', { defaultValue: 'Trust consistency' })}</p>
            <p className="text-lg font-semibold">{user?.trustScore || 0}%</p>
          </div>
        </div>
      </div>

      {/* Risk + Claims */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield size={18} className="text-primary-600" />
              {t('profile.riskLevel', { defaultValue: 'Risk Level' })}
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${risk.cls}`}>{risk.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all ${risk.bg}`} style={{ width: `${Math.min(100, Number(stats?.risk_score ?? 0))}%` }} />
          </div>
          <p className="text-[11px] text-gray-500 mt-2">{Number(stats?.risk_score ?? 0)}/100</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl">
          <h3 className="font-semibold">{t('profile.totalClaims', { defaultValue: 'Total claims' })}</h3>
          <p className="text-3xl font-bold text-primary-700 mt-2">{stats.claims}</p>
          <p className="text-xs text-gray-500 mt-1">{t('profile.completedHeld', { defaultValue: 'Completed / Held' })}: {stats.completed} / {stats.held}</p>
        </div>
      </div>

      {/* Language */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl">
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold">{t('profile.language')}</h3>
          <span className="text-primary-600 text-sm">{localStorage.getItem('gigshield_lang') || 'en'}</span>
        </button>
        {showLangPicker && (
          <div className="mt-3">
            <LanguagePicker
              compact
              onSelect={(code) => {
                handleSave({ language: code });
                setShowLangPicker(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('profile.deliveryPlatform')}</span>
          <span className="font-medium">{user?.platform}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('profile.yourZone')}</span>
          <span className="font-medium">{user?.zone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('profile.upiAccount')}</span>
          <span className="font-medium">{user?.upiId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('profile.weeklyEarnings')}</span>
          <span className="font-medium">₹{user?.avgWeeklyEarnings}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 backdrop-blur-xl space-y-3">
        <h3 className="font-semibold">{t('profile.notifications')}</h3>
        <label className="flex items-center justify-between min-h-touch">
          <span className="text-gray-600">{t('profile.whatsapp')}</span>
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary-600"
            onChange={(e) => {
              if (e.target.checked) triggerWhatsappAlert();
            }}
          />
        </label>
        <label className="flex items-center justify-between min-h-touch">
          <span className="text-gray-600">{t('profile.sms')}</span>
          <input
            type="checkbox"
            className="w-5 h-5 accent-primary-600"
            onChange={(e) => {
              if (e.target.checked) triggerSmsAlert();
            }}
          />
        </label>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-medium min-h-touch">
        <LogOut size={18} /> {t('profile.logout')}
      </button>
    </div>
  );
}
