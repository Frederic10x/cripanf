'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  onSearchClick?: () => void;
}

export default function MobileNav({ onSearchClick }: MobileNavProps) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <nav className={styles.nav}>
      <Link
        href="/dashboard"
        className={`${styles.item} ${isDashboard ? styles.itemActive : ''}`}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className={styles.label}>Dashboard</span>
      </Link>

      <button
        className={styles.item}
        onClick={onSearchClick}
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className={styles.label}>Rechercher</span>
      </button>

      <Link href="/note/new" className={styles.fab}>
        <svg
          className={styles.fabIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      <button className={styles.item}>
        <Image
          src="/svg/profile.svg"
          alt="Profile"
          width={24}
          height={24}
          className={styles.icon}
        />
        <span className={styles.label}>Profile</span>
      </button>

      <button className={styles.item}>
        <span className={styles.icon}>⋮</span>
        <span className={styles.label}>Menu</span>
      </button>
    </nav>
  );
}
