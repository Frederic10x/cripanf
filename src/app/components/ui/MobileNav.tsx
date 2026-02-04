'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === '/dashboard';
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

      <div className={styles.profileWrapper} ref={profileMenuRef}>
        <button
          className={styles.item}
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <Image
            src="/svg/profile.svg"
            alt="Profile"
            width={24}
            height={24}
            className={styles.icon}
          />
          <span className={styles.label}>Profile</span>
        </button>
        {showProfileMenu && (
          <div className={styles.profileMenu}>
            <button
              className={styles.profileMenuItem}
              onClick={handleLogout}
            >
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
