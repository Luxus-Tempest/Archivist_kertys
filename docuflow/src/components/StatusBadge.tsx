import React from 'react';
import { FileStatus } from '../types';
import styles from './StatusBadge.module.css';

interface Props {
  status: FileStatus;
}

const CONFIG: Record<FileStatus, { label: string; className: string }> = {
  pending:    { label: 'En attente',    className: 'pending' },
  processing: { label: 'En traitement', className: 'processing' },
  classified: { label: 'Classifié',     className: 'classified' },
  uploaded:   { label: 'Importé',       className: 'uploaded' },
  error:      { label: 'Erreur',        className: 'error' },
};

export default function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status];
  return <span className={`${styles.badge} ${styles[className]}`}>{label}</span>;
}
