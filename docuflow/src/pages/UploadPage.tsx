import React from 'react';
import DropZone from '../components/DropZone';
import FileRow from '../components/FileRow';
import { TrackedFile } from '../types';
import styles from './UploadPage.module.css';

interface Props {
  sessionId: string | null;
  files: TrackedFile[];
  isUploading: boolean;
  uploadError: string | null;
  onFiles: (files: File[]) => void;
  onReset: () => void;
}

export default function UploadPage({
  sessionId,
  files,
  isUploading,
  uploadError,
  onFiles,
  onReset,
}: Props) {
  const uploadedCount = files.filter(f => f.status === 'uploaded').length;
  const errorCount    = files.filter(f => f.status === 'error').length;
  const allDone       = files.length > 0 && files.every(f => f.status === 'uploaded' || f.status === 'error');

  return (
    <div className={styles.page}>
      <DropZone onFiles={onFiles} disabled={isUploading} />

      {isUploading && (
        <div className={styles.uploading}>
          <div className={styles.spinner} />
          <span>Upload en cours…</span>
        </div>
      )}

      {uploadError && (
        <div className={styles.errorBanner}>
          <span>Erreur : {uploadError}</span>
          <button onClick={onReset} className={styles.retryBtn}>Réessayer</button>
        </div>
      )}

      {files.length > 0 && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.headerLeft}>
              <span className={styles.panelTitle}>Fichiers en cours</span>
              {sessionId && (
                <span className={styles.sessionBadge} title="Session ID">
                  {sessionId}
                </span>
              )}
            </div>

            <div className={styles.headerRight}>
              {allDone && (
                <>
                  <span className={styles.summary}>
                    {uploadedCount}/{files.length} importés
                    {errorCount > 0 && ` · ${errorCount} erreur${errorCount > 1 ? 's' : ''}`}
                  </span>
                  <button onClick={onReset} className={styles.newBtn}>
                    Nouvelle session
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            {files.map(file => (
              <FileRow key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !isUploading && !uploadError && (
        <p className={styles.hint}>Aucun fichier pour cette session — glissez ou cliquez ci-dessus</p>
      )}
    </div>
  );
}
