'use client';

import { useState } from 'react';
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
    { id: 'all', label: 'Toutes les notes', icon: '⊞', category: null },
    { id: 'todo', label: 'À faire', icon: '☑', category: 'todo' },
    { id: 'done', label: 'Fait', icon: '✓', category: 'done' },
    { id: 'recurring', label: 'Tâches cycliques', icon: '↻', category: 'recurring' },
    { id: 'waiting', label: 'Attente de retour', icon: '👥', category: 'waiting_followup' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>C</div>
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
                <span className={styles.itemIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
