import React from 'react';

interface AuthPageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  imageAlt: string;
  imageSrc: string;
  headline: React.ReactNode;
  description: string;
}

export function AuthPageLayout({
  children,
  title,
  subtitle,
  imageAlt,
  imageSrc,
  headline,
  description,
}: AuthPageLayoutProps) {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex justify-between items-center px-8 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <span className="text-xl font-bold tracking-tighter text-slate-800 font-headline">Archivist</span>
        </div>
        <div className="hidden md:flex gap-8 items-center text-sm font-medium text-on-surface-variant">
          <a className="px-5 py-2 border border-outline-variant/30 rounded-full hover:bg-surface-container-high transition-all" href="#">About</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-surface-container-lowest rounded-3xl overflow-hidden shadow-editorial min-h-[600px]">
          {/* Left Side: Visual/Branding */}
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

          {/* Right Side: Form Content */}
          <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
            <div className="max-w-md w-full mx-auto space-y-10">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{title}</h2>
                <p className="text-on-surface-variant font-body">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-on-surface">
        <p className="text-xs text-outline-variant tracking-widest font-body uppercase">
          © 2024 Archivist Document Systems. Secure. Private. Editorial.
        </p>
      </footer>
    </div>
  );
}
