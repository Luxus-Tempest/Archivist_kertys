import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslation from './locales/en/translation.json'
import frTranslation from './locales/fr/translation.json'
import esTranslation from './locales/es/translation.json'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    returnEmptyString: false,
    fallbackLng: 'en',
    defaultNS: 'translation',
    resources: {
      en: { translation: enTranslation },
      fr: { translation: frTranslation },
      es: { translation: esTranslation },
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18next
