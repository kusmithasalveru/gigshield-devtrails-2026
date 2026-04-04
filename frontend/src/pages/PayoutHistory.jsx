import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CloudRain, Wind, Thermometer, CloudLightning, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../App';
import PayoutBadge from '../components/PayoutBadge';
import { getWorkerPayouts } from '../api/client';

const EVENT_ICONS = {
  heavy_rain: CloudRain, moderate_rain: CloudRain, severe_pollution: Wind,
  extreme_heat: Thermometer, flash_flood: CloudLightning, strike: Megaphone
};

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  held: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700'
};

export default function PayoutHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkerPayouts(user?.id).then(data => {
      setPayouts(data);
      setLoading(false);
    });
  }, [user?.id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">{t('common.loading')}</div>;
  }

  const totalReceived = payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('payouts.title')}</h1>

      {/* Total */}
      {totalReceived > 0 && (
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-green-700 font-bold text-2xl">₹{totalReceived}</p>
          <p className="text-green-600 text-sm">{t('payouts.totalReceived', { amount: totalReceived })}</p>
        </div>
      )}

      {/* List */}
      {payouts.length === 0 ? (
        <div className="card text-center py-10 text-gray-400">{t('payouts.noPayouts')}</div>
      ) : (
        <div className="space-y-3">
          {payouts.map(payout => {
            const Icon = EVENT_ICONS[payout.eventType] || CloudRain;
            const isExpanded = expandedId === payout.id;

            return (
              <div key={payout.id} className="card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : payout.id)}
                  className="w-full flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{t(`common.${payout.eventType}`)}</p>
                    <p className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className={`font-bold ${payout.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                        {payout.status === 'completed' ? '+' : ''}₹{payout.amount}
                      </p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[payout.status] || ''}`}>
                        {t(`payouts.${payout.status}`)}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><strong>{t('payouts.eventDetails')}:</strong> {payout.description}</p>
                      <p className="mt-1">{t('payouts.disruptedHours', { hours: payout.disruptedHours })}</p>
                      <p>{t('claims.zone')}: {payout.zone}</p>
                    </div>
                    <PayoutBadge
                      amount={payout.amount}
                      eventType={payout.eventType}
                      date={payout.date}
                      description={payout.description}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
