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
import esAstrology from '../locales/es/astrology.json';
import enAstrology from '../locales/en/astrology.json';

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
        astrology: esAstrology,
      },
      en: {
        common: enCommon,
        welcome: enWelcome,
        auth: enAuth,
        communities: enCommunities,
        passport: enPassport,
        astrology: enAstrology,
      },
    },
    supportedLngs: ['es', 'en'],
    fallbackLng: 'es',
    debug: import.meta.env.DEV,
    ns: ['common', 'welcome', 'auth', 'communities', 'passport', 'astrology'],
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
    parseMissingKeyHandler: (key: string, defaultValue?: string) => {
      if (defaultValue) return defaultValue;
      // Extraer la subclave limpia si viene con namespace (ej: "tabs.presentation" -> "Presentation")
      const parts = key.split('.');
      const rawKey = parts[parts.length - 1];
      // Si la clave tiene formato en camello/snake/kebab, humanizar
      return rawKey
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (str) => str.toUpperCase());
    },
  });

const syncHtmlLang = (lng: string) => {
  if (typeof document !== 'undefined') {
    const langCode = lng ? lng.split('-')[0] : 'es';
    document.documentElement.lang = langCode;
  }
};

syncHtmlLang(i18n.language || i18n.options.fallbackLng as string || 'es');

i18n.on('languageChanged', (lng) => {
  syncHtmlLang(lng);
});

export default i18n;
