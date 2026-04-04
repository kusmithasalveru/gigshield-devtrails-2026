import AlertBanner from './AlertBanner';
import BottomNav from './BottomNav';
import useTriggerFeed from '../hooks/useTriggerFeed';

export default function Layout({ children }) {
  const { triggers } = useTriggerFeed();

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <AlertBanner alerts={triggers} />
      <main className="pb-20 px-4 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
