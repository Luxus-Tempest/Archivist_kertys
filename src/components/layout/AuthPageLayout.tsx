import React from 'react';
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '../LanguageSelector';
import { SvgIcon } from '../SvgIcon';
// import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

interface AuthPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  imageAlt?: string;
  imageSrc?: string;
  headline?: React.ReactNode;
  description?: string;
  stepIndicator?: React.ReactNode;
  displayLeftImage?: boolean;
}

export function AuthPageLayout({
  children,
  title,
  subtitle,
  imageAlt,
  imageSrc,
  headline,
  description,
  stepIndicator,
  displayLeftImage = true,
}: AuthPageLayoutProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 py-3">
        <div className="flex items-center gap-2">
          <SvgIcon name='logo' width="100%" height="100%" className="w-32 h-10" />

          {/* <AccountBalanceWalletRoundedIcon className="text-primary" />
          <span className="text-xl font-bold tracking-tighter text-slate-800 font-headline">{t('DocPulseAI', 'DocPulseAI')}</span> */}
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-on-surface-variant">
          <LanguageSelector />
          <a className="px-5 py-2 border border-outline-variant/30 rounded-full hover:bg-surface-container-high transition-all" href="#">{t('about', 'About')}</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex items-center justify-center px-6 pt-24 pb-12">
        {/* <main className="grow flex items-center justify-center px-6 pt-24 pb-12"> */}
        <div className={`bg-surface-container-lowest rounded-3xl overflow-hidden shadow-editorial h-max ${
          displayLeftImage
            ? 'w-full max-w-[1100px] grid md:grid-cols-2'
            : 'w-full max-w-fit'
        }`}>
          {/* Left Side: Visual/Branding */}
          {displayLeftImage && (
            <div className="relative hidden md:flex flex-col justify-end p-12 bg-primary overflow-hidden">
              <img
                alt={imageAlt}
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                src={imageSrc}
              />
              <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/20 to-transparent"></div>
              <div className="relative z-10 space-y-4 text-on-primary">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight leading-tight">
                  {headline}
                </h1>
                <p className="text-on-primary/70 font-body text-lg max-w-sm">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Right Side: Form Content */}
          <div className="flex flex-col justify-center p-8 md:p-10 lg:p-12">
            <div className="w-full space-y-6">
              <div className="space-y-2">
                {stepIndicator}
                <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{title}</h2>
                <p className="text-on-surface-variant font-body">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      {/* <footer className="p-8 text-center text-on-surface">
        <p className="text-xs text-outline-variant tracking-widest font-body uppercase">
          {t('2024DocPulseAIDocumentSystemsSecurePrivateEditorial', '© 2024 DocPulseAI Document Systems. Secure. Private. Editorial.')}
        </p>
      </footer> */}
    </div>
  );
}
