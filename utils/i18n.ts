import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// importa as tuas traduções estáticas
import en from '../app/locales/en/translation.json';
import es from '../app/locales/es/translation.json';
import fr from '../app/locales/fr/translation.json';
import pt from '../app/locales/pt/translation.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',      // para json puros
    lng: 'pt',                    // idioma inicial
    fallbackLng: 'pt',
    resources: { en: { translation: en },
                 es: { translation: es },
                 fr: { translation: fr },
                 pt: { translation: pt } },
    interpolation: { escapeValue: false },
  });

export default i18n;