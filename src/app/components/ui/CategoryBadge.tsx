'use client';

import { Category, CATEGORY_LABELS } from '@/lib/types/note';
import styles from './CategoryBadge.module.css';

interface CategoryBadgeProps {
  category: Category;
}

const categoryIcons: Record<Category, string> = {
  todo: '📋',
  done: '✅',
  recurring: '🔄',
  waiting_followup: '⏳',
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const getBadgeClass = () => {
    switch (category) {
      case 'todo':
        return styles.badgeTodo;
      case 'done':
        return styles.badgeDone;
      case 'recurring':
        return styles.badgeRecurring;
      case 'waiting_followup':
        return styles.badgeWaiting;
      default:
        return styles.badgeTodo;
    }
  };

  return (
    <div className={`${styles.badge} ${getBadgeClass()}`}>
      <span className={styles.icon}>{categoryIcons[category]}</span>
      <span className={styles.label}>
        {CATEGORY_LABELS[category].toUpperCase()}
      </span>
    </div>
  );
}
