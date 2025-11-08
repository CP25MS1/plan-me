import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

const isInitialized = i18n.isInitialized;

if (!isInitialized) {
  i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'th'],
      defaultNS: 'common',
      ns: ['common'],
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: { useSuspense: false },
      interpolation: { escapeValue: false },
    });
}

export default i18n;
