import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import styles from './DropZone.module.css';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function DropZone({ onFiles, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = '';
  }

  return (
    <div
      className={`${styles.zone} ${dragging ? styles.dragging : ''} ${disabled ? styles.disabled : ''}`}
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      aria-label="Zone de dépôt de fichiers"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <div className={styles.iconWrap}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#7F77DD" strokeWidth="1.5">
          <path d="M11 14V4M7 7.5L11 4l4 3.5" />
          <path d="M3 16v2a1.5 1.5 0 001.5 1.5h13A1.5 1.5 0 0019 18v-2" />
        </svg>
      </div>

      <p className={styles.title}>
        {dragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
      </p>
      <p className={styles.sub}>
        ou <span className={styles.link}>cliquez pour parcourir</span> — tous types acceptés, 50 MB max par fichier
      </p>
    </div>
  );
}
