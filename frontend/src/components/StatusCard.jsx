import { useTranslation } from 'react-i18next';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const STATUS_CONFIG = {
  covered: {
    icon: ShieldCheck,
    color: 'border-l-covered text-covered',
    bg: 'bg-green-50',
    labelKey: 'common.covered'
  },
  expiring: {
    icon: Clock,
    color: 'border-l-expiring text-expiring',
    bg: 'bg-yellow-50',
    labelKey: 'common.expiring'
  },
  action: {
    icon: AlertTriangle,
    color: 'border-l-action text-action',
    bg: 'bg-red-50',
    labelKey: 'common.actionNeeded'
  }
};

export default function StatusCard({ status = 'covered', policyTier, premium, coverageLimit, expiryDate }) {
  const { t } = useTranslation();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.covered;
  const Icon = config.icon;

  return (
    <div className={clsx('card border-l-4 flex items-start gap-3', config.color, config.bg)}>
      <div className="mt-1">
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-lg capitalize">
          {t(config.labelKey)}
        </div>
        {policyTier && (
          <div className="text-gray-600 text-sm mt-1">
            {t('dashboard.tier', { tier: policyTier })} &middot; {t('dashboard.premium', { amount: premium })}
          </div>
        )}
        {coverageLimit && (
          <div className="text-gray-500 text-sm">
            {t('dashboard.maxPayout', { amount: coverageLimit })}
          </div>
        )}
        {expiryDate && (
          <div className="text-xs text-gray-400 mt-1">
            {t('policy.coveredUntil', { date: new Date(expiryDate).toLocaleDateString() })}
          </div>
        )}
      </div>
    </div>
  );
}
