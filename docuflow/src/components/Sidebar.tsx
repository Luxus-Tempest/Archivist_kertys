import React from 'react';
import styles from './Sidebar.module.css';

export type PageKey = 'upload' | 'history' | 'settings';

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

// ─── Icons ──────────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2.5 10.5v2a1 1 0 001 1h9a1 1 0 001-1v-2M8 2v8M5.5 4.5L8 2l2.5 2.5" />
  </svg>
);

const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5.5" />
    <path d="M8 5v3l2 1.5" />
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" />
  </svg>
);

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { key: 'upload',   label: 'Traitement fichiers', icon: <IconUpload /> },
  { key: 'history',  label: 'Historique',          icon: <IconHistory /> },
  { key: 'settings', label: 'Paramètres',           icon: <IconSettings /> },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoCircle}>DF</div>
        <span className={styles.logoName}>DocuFlow</span>
      </div>

      <nav className={styles.nav}>
        <span className={styles.sectionLabel}>Menu</span>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`${styles.navItem} ${activePage === item.key ? styles.active : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.bottomUser}>
        <div className={styles.avatar}>U</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Utilisateur</span>
          <span className={styles.userRole}>Administrateur</span>
        </div>
      </div>
    </aside>
  );
}
