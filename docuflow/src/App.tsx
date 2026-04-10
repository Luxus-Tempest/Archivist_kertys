import React, { useState } from 'react';
import Sidebar, { PageKey } from './components/Sidebar';
import UploadPage from './pages/UploadPage';
import HistoryPage from './pages/HistoryPage';
import { useFileProcessor } from './hooks/useFileProcessor';
import styles from './App.module.css';

const PAGE_META: Record<PageKey, { title: string; subtitle: string }> = {
  upload: {
    title:    'Traitement de fichiers',
    subtitle: 'Uploadez vos fichiers et suivez leur traitement en temps réel',
  },
  history: {
    title:    'Historique',
    subtitle: 'Toutes vos sessions de traitement passées',
  },
  settings: {
    title:    'Paramètres',
    subtitle: 'Configuration de votre espace de travail',
  },
};

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('upload');

  const {
    sessionId,
    files,
    isUploading,
    uploadError,
    uploadFiles,
    reset,
    getSessionsFromStorage,
  } = useFileProcessor();

  const meta = PAGE_META[activePage];

  return (
    <div className={styles.app}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div>
            <h1 className={styles.pageTitle}>{meta.title}</h1>
            <p className={styles.pageSub}>{meta.subtitle}</p>
          </div>
        </header>

        {/* Content area */}
        <main className={styles.content}>
          {activePage === 'upload' && (
            <UploadPage
              sessionId={sessionId}
              files={files}
              isUploading={isUploading}
              uploadError={uploadError}
              onFiles={uploadFiles}
              onReset={reset}
            />
          )}

          {activePage === 'history' && (
            <HistoryPage getSessions={getSessionsFromStorage} />
          )}

          {activePage === 'settings' && (
            <div className={styles.placeholder}>
              <p>Page paramètres — à implémenter</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
