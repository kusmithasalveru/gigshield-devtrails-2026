import { useTranslation } from 'react-i18next';
import { CloudRain, Wind, Thermometer, CloudLightning, Megaphone, Sun, CheckCircle, Loader, Search, CreditCard } from 'lucide-react';
import useTriggerFeed from '../hooks/useTriggerFeed';

const EVENT_ICONS = {
  heavy_rain: CloudRain, moderate_rain: CloudRain, severe_pollution: Wind,
  extreme_heat: Thermometer, flash_flood: CloudLightning, strike: Megaphone
};

const STEPS = ['detecting', 'validating', 'processing', 'paid'];
const STEP_ICONS = { detecting: Search, validating: Loader, processing: CreditCard, paid: CheckCircle };

export default function ClaimStatus() {
  const { t } = useTranslation();
  const { triggers, connected } = useTriggerFeed();

  // Simulate progress: triggers with > 30 min duration are further along
  const getStep = (trigger) => {
    if (trigger.durationMinutes >= 60) return 3; // paid
    if (trigger.durationMinutes >= 45) return 2; // processing
    if (trigger.durationMinutes >= 30) return 1; // validating
    return 0; // detecting
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('claims.title')}</h1>
        <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>

      {triggers.length === 0 ? (
        <div className="card text-center py-10">
          <Sun size={48} className="mx-auto text-yellow-400 mb-3" />
          <p className="text-gray-500">{t('claims.noActive')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {triggers.map(trigger => {
            const Icon = EVENT_ICONS[trigger.eventType] || CloudRain;
            const currentStep = getStep(trigger);

            return (
              <div key={trigger.id} className="card space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon size={24} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{t(`common.${trigger.eventType}`)}</p>
                    <p className="text-sm text-gray-500">
                      {trigger.zone} &middot; {trigger.triggerValue}{trigger.unit}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    trigger.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {trigger.severity}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{t('claims.duration')}:</span>
                  <span className="font-medium">
                    {trigger.durationMinutes >= 60
                      ? t('claims.hours', { count: Math.round(trigger.durationMinutes / 60 * 10) / 10 })
                      : t('claims.minutes', { count: trigger.durationMinutes })
                    }
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-1">
                  {STEPS.map((step, idx) => {
                    const StepIcon = STEP_ICONS[step];
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className={`flex flex-col items-center flex-1 ${
                          isCompleted ? 'text-primary-600' : 'text-gray-300'
                        }`}>
                          <StepIcon size={18} className={isCurrent && step !== 'paid' ? 'animate-pulse' : ''} />
                          <span className="text-[10px] mt-1 font-medium">{t(`claims.${step}`)}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-1 rounded ${
                            idx < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
