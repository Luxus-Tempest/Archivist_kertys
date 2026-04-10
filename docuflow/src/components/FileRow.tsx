import React from 'react';
import { TrackedFile } from '../types';
import StatusBadge from './StatusBadge';
import styles from './FileRow.module.css';

interface Props {
  file: TrackedFile;
}

function getExt(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase().slice(0, 4) : 'FILE';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_COLORS: Record<string, string> = {
  PDF:  '#FCEBEB',
  DOCX: '#E6F1FB',
  DOC:  '#E6F1FB',
  XLSX: '#EAF3DE',
  XLS:  '#EAF3DE',
  PPTX: '#FAEEDA',
  PPT:  '#FAEEDA',
  PNG:  '#EEEDFE',
  JPG:  '#EEEDFE',
  JPEG: '#EEEDFE',
  CSV:  '#EAF3DE',
  TXT:  '#F1EFE8',
};

export default function FileRow({ file }: Props) {
  const ext = getExt(file.name);
  const thumbBg = EXT_COLORS[ext] ?? '#F1EFE8';

  return (
    <div className={styles.row}>
      <div className={styles.thumb} style={{ background: thumbBg }}>
        {ext}
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{file.name}</span>
        <span className={styles.meta}>
          {formatSize(file.size)}
          {file.errorMessage && (
            <span className={styles.errorMsg}> — {file.errorMessage}</span>
          )}
        </span>
        <div className={styles.barWrap}>
          <div
            className={`${styles.bar} ${file.status === 'error' ? styles.barError : ''}`}
            style={{ width: `${file.progress}%` }}
          />
        </div>
      </div>

      <StatusBadge status={file.status} />
    </div>
  );
}
