import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../App';
import LanguagePicker from '../components/LanguagePicker';
import { getDashboardWorker } from '../api/mlApi';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [dash, setDash] = useState(null);
  const [dashSimulated, setDashSimulated] = useState(false);

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
  const trustBg = user?.trustScore >= 60 ? 'bg-green-500' : user?.trustScore >= 30 ? 'bg-amber-500' : 'bg-red-500';

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await getDashboardWorker(user?.id);
        if (!cancelled) {
          setDash(res);
          setDashSimulated(false);
        }
      } catch {
        if (!cancelled) {
          setDash({
            risk_score: 41,
            claim_status: { total: 5, completed: 3, held: 2 },
          });
          setDashSimulated(true);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const risk = useMemo(() => {
    const s = Number(dash?.risk_score ?? 0);
    if (s >= 70) return { label: 'High', cls: 'bg-amber-100 text-amber-800', bg: 'bg-amber-500' };
    if (s >= 35) return { label: 'Medium', cls: 'bg-amber-100 text-amber-700', bg: 'bg-amber-500' };
    return { label: 'Low', cls: 'bg-green-100 text-green-700', bg: 'bg-green-500' };
  }, [dash?.risk_score]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('profile.title')}</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-center gap-2">
          <Check size={18} /> {t('profile.saved')}
        </div>
      )}

      {dashSimulated && (
        <div className="card text-sm text-amber-800 bg-amber-50 border-amber-100">
          Simulated Response (API failed)
        </div>
      )}

      {/* User Info */}
      <div className="card flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
          <User size={28} className="text-primary-600" />
        </div>
        <div>
          <p className="font-bold text-lg">{user?.name}</p>
          <p className="text-gray-500 text-sm">+91 {user?.phone} &middot; {user?.platform}</p>
        </div>
      </div>

      {/* Trust Score */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield size={18} className="text-primary-600" />
            {t('profile.trustScore')}
          </h3>
          <span className={`text-2xl font-bold ${trustColor}`}>{user?.trustScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all ${trustBg}`} style={{ width: `${user?.trustScore}%` }} />
        </div>
      </div>

      {/* Risk + Claims */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Shield size={18} className="text-primary-600" />
              Risk Level
            </h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${risk.cls}`}>{risk.label}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all ${risk.bg}`} style={{ width: `${Math.min(100, Number(dash?.risk_score ?? 0))}%` }} />
          </div>
          <p className="text-[11px] text-gray-500 mt-2">{Number(dash?.risk_score ?? 0)}/100</p>
        </div>

        <div className="card">
          <h3 className="font-semibold">Total claims</h3>
          <p className="text-3xl font-bold text-primary-700 mt-2">{dash?.claim_status?.total ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Completed / Held: {dash?.claim_status?.completed ?? 0} / {dash?.claim_status?.held ?? 0}</p>
        </div>
      </div>

      {/* Language */}
      <div className="card">
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
      <div className="card space-y-4">
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
      <div className="card space-y-3">
        <h3 className="font-semibold">{t('profile.notifications')}</h3>
        <label className="flex items-center justify-between min-h-touch">
          <span className="text-gray-600">{t('profile.whatsapp')}</span>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600" />
        </label>
        <label className="flex items-center justify-between min-h-touch">
          <span className="text-gray-600">{t('profile.sms')}</span>
          <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-600" />
        </label>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-medium min-h-touch">
        <LogOut size={18} /> {t('profile.logout')}
      </button>
    </div>
  );
}
