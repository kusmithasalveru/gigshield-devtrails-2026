import BottomNav from './BottomNav';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTriggerFeed from '../hooks/useTriggerFeed';

export default function Layout({ children }) {
  const { t } = useTranslation();
  const { triggers, connected } = useTriggerFeed();
  const [dark, setDark] = useState(() => localStorage.getItem('gigshield_theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('gigshield_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('gigshield_theme', 'light');
    }
  }, [dark]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 pt-5">
        <div className="mb-5 rounded-2xl border border-white/30 bg-white/80 dark:bg-slate-900/70 dark:border-slate-800 backdrop-blur-xl px-4 py-3 shadow-lg flex items-center justify-between max-w-md mx-auto">
          <p className="font-semibold tracking-tight">{t('layout.title', { defaultValue: 'GigShield' })}</p>
          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 hover:scale-105 transition"
            aria-label={t('profile.language')}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="mb-4 max-w-md mx-auto rounded-xl border border-indigo-200/60 bg-indigo-50 dark:bg-indigo-950/30 dark:border-indigo-800/40 px-3 py-2 text-xs text-indigo-700 dark:text-indigo-300">
          {t('layout.triggerStatus', { defaultValue: 'Trigger monitor' })}: {connected ? t('layout.live', { defaultValue: 'Live' }) : t('layout.fallback', { defaultValue: 'Fallback mode' })} | {t('layout.activeEvents', { defaultValue: 'Active events' })}: {triggers.length}
        </div>
      </div>
      <main className="pb-28 px-4 mx-auto max-w-md">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
