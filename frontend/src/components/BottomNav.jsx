import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Wallet, User, Radar } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard', { defaultValue: 'Dashboard' }) },
    { path: '/claims', icon: Activity, label: t('nav.claimFlow', { defaultValue: 'Claim Flow' }) },
    { path: '/fraud', icon: Radar, label: t('nav.fraud', { defaultValue: 'Fraud' }) },
    { path: '/payouts', icon: Wallet, label: t('nav.payout', { defaultValue: 'Payout' }) },
    { path: '/profile', icon: User, label: t('nav.profile', { defaultValue: 'Profile' }) }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="mx-auto max-w-md rounded-2xl border border-white/30 bg-white/90 dark:bg-slate-900/85 dark:border-slate-700 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-around items-center">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-3 min-h-touch min-w-touch',
                'transition-colors',
                isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400'
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
