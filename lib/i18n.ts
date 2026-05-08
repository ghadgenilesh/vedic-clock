import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './locales/en';
import hi from './locales/hi';
import kn from './locales/kn';
import mr from './locales/mr';
import sa from './locales/sa';
import ta from './locales/ta';
import te from './locales/te';

export const i18n = new I18n({ en, hi, sa, te, ta, kn, mr });

i18n.enableFallback = true;
i18n.defaultLocale = 'en';
i18n.locale = getLocales()[0]?.languageCode ?? 'en';

export function setLocale(locale: string) {
  i18n.locale = locale;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'sa', label: 'संस्कृत' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
];
