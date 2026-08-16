import 'i18next';
import type esCommon from '../locales/es/common.json';
import type esWelcome from '../locales/es/welcome.json';
import type esAuth from '../locales/es/auth.json';
import type esCommunities from '../locales/es/communities.json';
import type esPassport from '../locales/es/passport.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof esCommon;
      welcome: typeof esWelcome;
      auth: typeof esAuth;
      communities: typeof esCommunities;
      passport: typeof esPassport;
    };
  }
}
