import { useEffect } from 'react';
import { useRegional } from '../context/RegionalContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Bridge component that auto-syncs language and currency
 * when the user selects a different country.
 * Renders nothing — just wires context callbacks.
 */
export default function GlobalConfigBridge() {
  const { registerOnCountryChange } = useRegional();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    registerOnCountryChange((config) => {
      // Auto-switch language based on country config
      if (config.language) {
        setLanguage(config.language);
      }
    });
  }, [registerOnCountryChange, setLanguage]);

  return null;
}
