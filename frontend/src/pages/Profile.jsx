import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Shield, LogOut, Check } from 'lucide-react';
import { useAuth } from '../App';
import LanguagePicker from '../components/LanguagePicker';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

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

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('profile.title')}</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-center gap-2">
          <Check size={18} /> {t('profile.saved')}
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
