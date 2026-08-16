import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation('common');

  const currentLang = i18n.language ? i18n.language.split('-')[0] : 'es';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      aria-label={t('language.selector' as any)}
      title={t('language.selector' as any)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A4E4D] bg-[#EAE2D6]/60 hover:bg-[#EAE2D6] hover:text-[#2A2D2C] transition-all border border-[#EAE2D6] focus:outline-none focus:ring-2 focus:ring-[#CB997E] ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-[#6B705C]" aria-hidden="true" />
      <span className="uppercase font-bold tracking-wider">{currentLang}</span>
      <span className="hidden sm:inline text-stone-500 font-normal">
        ({currentLang === 'es' ? t('language.es' as any) : t('language.en' as any)})
      </span>
    </button>
  );
};
