import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useAuth } from '../App';
import VoiceButton from '../components/VoiceButton';
import { getDisputes, getWorkerPayouts, submitDispute } from '../api/client';

export default function DisputePortal() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [heldPayouts, setHeldPayouts] = useState([]);
  const [disputingId, setDisputingId] = useState(null);
  const [inputMethod, setInputMethod] = useState(null); // 'voice' | 'text'
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      getDisputes(user?.id),
      getWorkerPayouts(user?.id)
    ]).then(([disp, pays]) => {
      setDisputes(disp);
      setHeldPayouts(pays.filter(p => p.status === 'held'));
    });
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    const result = await submitDispute(disputingId, reason);
    setDisputes(prev => [...prev, result]);
    setHeldPayouts(prev => prev.filter(p => p.id !== disputingId));
    setSubmitting(false);
    setSubmitted(true);
    setDisputingId(null);
    setInputMethod(null);
    setReason('');
    setTimeout(() => setSubmitted(false), 3000);
  };

  const STATUS_ICONS = {
    under_review: Clock,
    resolved: CheckCircle
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">{t('dispute.title')}</h1>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} /> {t('dispute.submitted')}
        </div>
      )}

      {/* Held Payouts — available for dispute */}
      {heldPayouts.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-2">{t('dispute.flaggedClaims')}</h2>
          <div className="space-y-3">
            {heldPayouts.map(payout => (
              <div key={payout.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{t(`common.${payout.eventType}`)}</p>
                    <p className="text-sm text-gray-500">₹{payout.amount} &middot; {payout.zone}</p>
                  </div>
                  <AlertCircle size={20} className="text-amber-500" />
                </div>

                {disputingId !== payout.id ? (
                  <button
                    onClick={() => setDisputingId(payout.id)}
                    className="btn-secondary w-full text-sm"
                  >
                    {t('dispute.tapToDispute')}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {!inputMethod ? (
                      <>
                        <p className="text-sm text-gray-600">{t('dispute.chooseMethod')}</p>
                        <div className="flex gap-3">
                          <button onClick={() => setInputMethod('voice')} className="btn-secondary flex-1 text-sm">
                            🎤 {t('dispute.voiceNote')}
                          </button>
                          <button onClick={() => setInputMethod('text')} className="btn-secondary flex-1 text-sm">
                            ✏️ {t('dispute.textInput')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {inputMethod === 'voice' && (
                          <div className="flex items-center gap-3">
                            <VoiceButton
                              lang={i18n.language}
                              onTranscript={(text) => setReason(prev => prev + ' ' + text)}
                            />
                            <span className="text-sm text-gray-500">
                              {reason ? reason : t('dispute.recording')}
                            </span>
                          </div>
                        )}

                        <textarea
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          placeholder={t('dispute.placeholder')}
                          rows={3}
                          className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => { setDisputingId(null); setInputMethod(null); setReason(''); }}
                            className="btn-secondary flex-1 text-sm"
                          >
                            {t('common.cancel')}
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={!reason.trim() || submitting}
                            className="btn-primary flex-1 text-sm"
                          >
                            {submitting ? t('common.loading') : t('dispute.submit')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Disputes */}
      {disputes.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-2">{t('dispute.title')}</h2>
          <div className="space-y-2">
            {disputes.map(dispute => {
              const StatusIcon = STATUS_ICONS[dispute.status] || Clock;
              return (
                <div key={dispute.id} className="card flex items-center gap-3">
                  <StatusIcon size={20} className={dispute.status === 'resolved' ? 'text-green-600' : 'text-amber-500'} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{dispute.reason}</p>
                    <p className="text-xs text-gray-500">{new Date(dispute.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    dispute.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {t(`dispute.${dispute.status === 'under_review' ? 'underReview' : dispute.status}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {heldPayouts.length === 0 && disputes.length === 0 && (
        <div className="card text-center py-10">
          <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">{t('dispute.noDisputes')}</p>
        </div>
      )}
    </div>
  );
}
