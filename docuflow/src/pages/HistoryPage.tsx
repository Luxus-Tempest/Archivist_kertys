import React, { useMemo } from 'react';
import { Session, FileStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import styles from './HistoryPage.module.css';

interface Props {
  getSessions: () => Session[];
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage({ getSessions }: Props) {
  const sessions = useMemo(() => getSessions(), [getSessions]);

  if (sessions.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B4B2A9" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>Aucune session trouvée</p>
        <p className={styles.emptySub}>Les sessions apparaîtront ici une fois que vous aurez traité des fichiers.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {sessions.map(session => {
        const totalSize = session.files.reduce((acc, f) => acc + f.size, 0);
        const uploadedCount = session.files.filter(f => f.status === 'uploaded').length;

        return (
          <div key={session.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.sessionId}>{session.id}</span>
                <span className={styles.date}>{formatDate(session.createdAt)}</span>
              </div>
              <div className={styles.cardStats}>
                <span>{session.files.length} fichier{session.files.length > 1 ? 's' : ''}</span>
                <span className={styles.dot}>·</span>
                <span>{formatSize(totalSize)}</span>
                <span className={styles.dot}>·</span>
                <span>{uploadedCount}/{session.files.length} importés</span>
              </div>
            </div>

            <div className={styles.fileList}>
              {session.files.map((file, idx) => (
                <div key={idx} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{formatSize(file.size)}</span>
                  <StatusBadge status={file.status as FileStatus} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
