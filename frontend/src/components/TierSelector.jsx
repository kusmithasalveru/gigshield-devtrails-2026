import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import usePremiumCalc from '../hooks/usePremiumCalc';

const TIERS = [
  { id: 'basic', limit: 200 },
  { id: 'standard', limit: 350 },
  { id: 'pro', limit: 600 }
];

export default function TierSelector({ selected, onSelect, peerChoice = {}, weeksActive = 0, zone }) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
      {TIERS.map(tier => {
        const isSelected = selected === tier.id;
        const peerPct = peerChoice[tier.id] || 0;

        return (
          <TierCard
            key={tier.id}
            tier={tier}
            isSelected={isSelected}
            peerPct={peerPct}
            weeksActive={weeksActive}
            zone={zone}
            onSelect={() => onSelect(tier.id)}
            t={t}
          />
        );
      })}
    </div>
  );
}

function TierCard({ tier, isSelected, peerPct, weeksActive, zone, onSelect, t }) {
  const { premium, loading } = usePremiumCalc({ zone, tier: tier.id, weeksActive });
  const isPopular = tier.id === 'standard';

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'min-w-[140px] flex-1 snap-center rounded-2xl p-4 text-left transition-all',
        'border-2 relative',
        isSelected
          ? 'border-primary-600 bg-primary-50 shadow-md'
          : 'border-gray-200 bg-white active:border-gray-300'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          {t('policy.recommended')}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-base capitalize">{t(`policy.${tier.id}`)}</span>
        {isSelected && <Check size={20} className="text-primary-600" />}
      </div>

      <div className="text-2xl font-bold text-gray-900">
        {loading ? '...' : `₹${premium}`}
        <span className="text-sm font-normal text-gray-500">{t('policy.perWeek')}</span>
      </div>

      <div className="text-sm text-gray-500 mt-1">
        {t('policy.upTo', { amount: tier.limit })}
      </div>

      {peerPct > 0 && (
        <div className="text-xs text-primary-600 mt-2 font-medium">
          {t('policy.peersChose', { percent: peerPct })}
        </div>
      )}
    </button>
  );
}
