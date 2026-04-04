import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../App';
import TierSelector from '../components/TierSelector';
import usePremiumCalc from '../hooks/usePremiumCalc';
import { purchasePolicy, getPeerChoice } from '../api/client';
import { useEffect } from 'react';

export default function PolicySelection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState('standard');
  const [peerChoice, setPeerChoice] = useState({});
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  const { premium, coverageLimit } = usePremiumCalc({
    zone: user?.zone,
    tier: selectedTier,
    weeksActive: user?.weeksActive || 0
  });

  useEffect(() => {
    getPeerChoice().then(setPeerChoice);
  }, []);

  const handlePurchase = async () => {
    setPurchasing(true);
    await purchasePolicy(user?.id, selectedTier);
    setPurchasing(false);
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-green-700 mb-1">{t('policy.success')}</h2>
        <p className="text-gray-500">{t('policy.coveredUntil', {
          date: new Date(Date.now() + 7 * 86400000).toLocaleDateString()
        })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t('policy.title')}</h1>

      {/* Week Forecast */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-500 mb-3">{t('policy.weekForecast')}</h3>
        <div className="flex justify-between">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
            <div key={day} className="text-center">
              <div className="text-xs text-gray-400 mb-1">{day}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                i === 2 || i === 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>
                {i === 2 || i === 3 ? '🌧' : '☀'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tier Selection */}
      <TierSelector
        selected={selectedTier}
        onSelect={setSelectedTier}
        peerChoice={peerChoice}
        weeksActive={user?.weeksActive || 0}
        zone={user?.zone}
      />

      {/* Summary */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-primary-600" />
          <div>
            <p className="font-bold text-primary-800 capitalize">{selectedTier} {t('policy.title')}</p>
            <p className="text-sm text-primary-600">
              ₹{premium}{t('policy.perWeek')} &middot; {t('policy.upTo', { amount: coverageLimit })}
            </p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePurchase}
        disabled={purchasing}
        className="btn-primary w-full text-lg"
      >
        {purchasing ? t('policy.processing') : t('policy.pay', { amount: premium })}
      </button>
    </div>
  );
}
