import pt from './pt';
import en from './en';
import es from './es';

export const LANGUAGES = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const translations = { pt, en, es };

export default translations;
