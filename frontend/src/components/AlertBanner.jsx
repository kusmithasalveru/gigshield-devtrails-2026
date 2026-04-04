import { useTranslation } from 'react-i18next';
import { AlertTriangle, CloudRain, Wind, Thermometer, CloudLightning, Megaphone } from 'lucide-react';
import clsx from 'clsx';

const EVENT_ICONS = {
  heavy_rain: CloudRain,
  moderate_rain: CloudRain,
  severe_pollution: Wind,
  extreme_heat: Thermometer,
  flash_flood: CloudLightning,
  strike: Megaphone
};

export default function AlertBanner({ alerts = [] }) {
  const { t } = useTranslation();

  if (alerts.length === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      {alerts.map(alert => {
        const Icon = EVENT_ICONS[alert.eventType] || AlertTriangle;
        return (
          <div key={alert.id} className="flex items-center gap-2 py-1">
            <Icon size={18} className="text-amber-600 flex-shrink-0" />
            <span className="text-sm text-amber-800 font-medium truncate">
              {t(`common.${alert.eventType}`)} — {alert.zone}
              {' '}({alert.triggerValue}{alert.unit})
            </span>
            <span className={clsx(
              'ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0',
              alert.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            )}>
              {alert.severity}
            </span>
          </div>
        );
      })}
    </div>
  );
}
