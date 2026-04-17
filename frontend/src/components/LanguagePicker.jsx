import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const LANGUAGES = [
  { code: 'te', label: 'తెలుగు', name: 'Telugu' },
  { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
  { code: 'ml', label: 'മലയാളം', name: 'Malayalam' },
  { code: 'bn', label: 'বাংলা', name: 'Bengali' },
  { code: 'mr', label: 'मराठी', name: 'Marathi' },
  { code: 'en', label: 'English', name: 'English' }
];

export default function LanguagePicker({ onSelect, compact = false }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('gigshield_lang', code);
    onSelect?.(code);
  };

  return (
    <div className={clsx('grid gap-3', compact ? 'grid-cols-4' : 'grid-cols-2')}>
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className={clsx(
            'min-h-touch rounded-xl p-3 text-center font-medium transition-all',
            'border-2 active:scale-95',
            current === lang.code
              ? 'border-primary-600 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          )}
        >
          <div className={compact ? 'text-sm' : 'text-lg'}>{lang.label}</div>
          {!compact && <div className="text-xs text-gray-500 mt-1">{lang.name}</div>}
        </button>
      ))}
    </div>
  );
}
