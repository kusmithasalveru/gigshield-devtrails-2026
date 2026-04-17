import { useTranslation } from 'react-i18next';
import { ShieldCheck, Share2 } from 'lucide-react';

export default function PayoutBadge({ amount, eventType, date, description }) {
  const { t } = useTranslation();

  const handleShare = async () => {
    const text = `GigShield protected me! Received ₹${amount} for ${t(`common.${eventType}`)}. #GigShield`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GigShield Payout', text });
      } catch {}
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={24} />
        <span className="font-bold text-sm">GigShield</span>
      </div>

      <div className="text-4xl font-bold mb-1">₹{amount}</div>

      <div className="text-primary-100 text-sm mb-1">
        {t(`common.${eventType}`)}
      </div>

      {description && (
        <div className="text-primary-200 text-xs mb-3">{description}</div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-primary-200 text-xs">
          {new Date(date).toLocaleDateString()}
        </span>
        <button
          onClick={handleShare}
          className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium min-h-touch active:bg-white/30"
        >
          <Share2 size={14} />
          {t('payouts.share')}
        </button>
      </div>
    </div>
  );
}
