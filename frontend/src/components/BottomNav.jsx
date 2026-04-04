import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Activity, Wallet, User } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/policy', icon: Shield, label: 'Policy' },
  { path: '/claims', icon: Activity, label: 'Claims' },
  { path: '/payouts', icon: Wallet, label: 'Payouts' },
  { path: '/profile', icon: User, label: 'Profile' }
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {TABS.map(tab => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={clsx(
                'flex flex-col items-center justify-center py-2 px-3 min-h-touch min-w-touch',
                'transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )}
            >
              <Icon size={22} />
              <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area for phones with bottom bars */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
