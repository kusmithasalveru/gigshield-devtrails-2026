import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import te from './locales/te.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      te: { translation: te },
      hi: { translation: hi },
      ta: { translation: ta },
      kn: { translation: kn },
      ml: { translation: ml },
      bn: { translation: bn },
      mr: { translation: mr }
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'gigshield_lang'
    }
  });

export default i18n;
