import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esCommon from '../locales/es/common.json';
import enCommon from '../locales/en/common.json';
import esWelcome from '../locales/es/welcome.json';
import enWelcome from '../locales/en/welcome.json';
import esAuth from '../locales/es/auth.json';
import enAuth from '../locales/en/auth.json';
import esCommunities from '../locales/es/communities.json';
import enCommunities from '../locales/en/communities.json';
import esPassport from '../locales/es/passport.json';
import enPassport from '../locales/en/passport.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        welcome: esWelcome,
        auth: esAuth,
        communities: esCommunities,
        passport: esPassport,
      },
      en: {
        common: enCommon,
        welcome: enWelcome,
        auth: enAuth,
        communities: enCommunities,
        passport: enPassport,
      },
    },
    supportedLngs: ['es', 'en'],
    fallbackLng: 'es',
    ns: ['common', 'welcome', 'auth', 'communities', 'passport'],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kanarii.language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
