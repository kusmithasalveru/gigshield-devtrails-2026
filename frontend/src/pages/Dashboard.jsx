import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CloudRain, Wind, Thermometer, CloudLightning, Megaphone, Sun, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../App';
import StatusCard from '../components/StatusCard';
import useTriggerFeed from '../hooks/useTriggerFeed';
import { getActivePolicy, getWorkerPayouts } from '../api/client';

const EVENT_ICONS = {
  heavy_rain: CloudRain, moderate_rain: CloudRain, severe_pollution: Wind,
  extreme_heat: Thermometer, flash_flood: CloudLightning, strike: Megaphone
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { triggers } = useTriggerFeed();

  const [policy, setPolicy] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getActivePolicy(user?.id),
      getWorkerPayouts(user?.id)
    ]).then(([pol, pays]) => {
      setPolicy(pol);
      setPayouts(pays);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">{t('common.loading')}</div>;
  }

  const totalEarned = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const recentPayouts = payouts.slice(0, 3);

  const policyStatus = policy?.status === 'active' ? 'covered' : 'action';

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <h1 className="text-xl font-bold">{t('dashboard.welcome', { name: user?.name?.split(' ')[0] })}</h1>

      {/* Coverage Status */}
      {policy ? (
        <StatusCard
          status={policyStatus}
          policyTier={policy.tier}
          premium={policy.premium}
          coverageLimit={policy.coverageLimit}
          expiryDate={policy.weekEnd}
        />
      ) : (
        <div className="card text-center py-6">
          <Shield size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-3">{t('dashboard.noCoverage')}</p>
          <button onClick={() => navigate('/policy')} className="btn-primary">
            {t('dashboard.buyCoverage')}
          </button>
        </div>
      )}

      {/* Total Protected */}
      {totalEarned > 0 && (
        <div className="bg-primary-50 rounded-2xl p-4 text-center">
          <p className="text-primary-600 font-bold text-2xl">₹{totalEarned}</p>
          <p className="text-primary-500 text-sm">{t('dashboard.totalEarned', { amount: totalEarned })}</p>
        </div>
      )}

      {/* Active Alerts */}
      <div>
        <h2 className="font-semibold text-base mb-2">{t('dashboard.activeAlerts')}</h2>
        {triggers.length === 0 ? (
          <div className="card flex items-center gap-3 text-gray-400">
            <Sun size={24} />
            <span className="text-sm">{t('dashboard.noAlerts')}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {triggers.map(trigger => {
              const Icon = EVENT_ICONS[trigger.eventType] || CloudRain;
              return (
                <div key={trigger.id} className="card flex items-center gap-3" onClick={() => navigate('/claims')}>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon size={20} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t(`common.${trigger.eventType}`)}</p>
                    <p className="text-xs text-gray-500">{trigger.zone} &middot; {trigger.durationMinutes} min</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    trigger.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {trigger.severity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Payouts */}
      {recentPayouts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-base">{t('dashboard.recentPayouts')}</h2>
            <button onClick={() => navigate('/payouts')} className="text-primary-600 text-sm font-medium flex items-center gap-1">
              {t('dashboard.seeAll')} <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {recentPayouts.map(payout => {
              const Icon = EVENT_ICONS[payout.eventType] || CloudRain;
              return (
                <div key={payout.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Icon size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t(`common.${payout.eventType}`)}</p>
                    <p className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-600 font-bold">+₹{payout.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
