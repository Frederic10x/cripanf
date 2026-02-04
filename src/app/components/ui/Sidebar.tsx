'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './Sidebar.module.css';

interface SidebarProps {
  onCategoryChange?: (category: string | null) => void;
}

export default function Sidebar({ onCategoryChange }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('all');

  const handleItemClick = (id: string, category: string | null) => {
    setActiveItem(id);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const menuItems = [
    { id: 'all', label: 'Toutes les notes', icon: '/svg/all-notes.svg', category: null },
    { id: 'todo', label: 'À faire', icon: '/svg/todos.svg', category: 'todo' },
    { id: 'done', label: 'Fait', icon: '/svg/done.svg', category: 'done' },
    { id: 'recurring', label: 'Tâches cycliques', icon: '/svg/recurring.svg', category: 'recurring' },
    { id: 'waiting', label: 'Attente de retour', icon: '/svg/waiting_followup.svg', category: 'waiting_followup' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Image
          src="/svg/app.svg"
          alt="Cripan'"
          width={32}
          height={32}
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>Cripan'</span>
      </div>

      <nav className={styles.section}>
        <h2 className={styles.sectionTitle}>Espace</h2>
        <ul className={styles.list}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.item} ${
                  activeItem === item.id ? styles.itemActive : ''
                }`}
                onClick={() => handleItemClick(item.id, item.category)}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={styles.itemIcon}
                />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
