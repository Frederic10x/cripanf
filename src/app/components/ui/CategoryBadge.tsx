'use client';

import { Category, CATEGORY_LABELS } from '@/lib/types/note';
import styles from './CategoryBadge.module.css';

interface CategoryBadgeProps {
  category: Category;
}

const categoryIcons: Record<Category, string> = {
  todo: '/svg/todos.svg',
  done: '/svg/done.svg',
  recurring: '/svg/recurring.svg',
  waiting_followup: '/svg/waiting_followup.svg',
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
      <div
        className={styles.icon}
        style={{
          maskImage: `url(${categoryIcons[category]})`,
          WebkitMaskImage: `url(${categoryIcons[category]})`,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
          backgroundColor: 'currentColor',
        }}
      />
      <span className={styles.label}>
        {CATEGORY_LABELS[category].toUpperCase()}
      </span>
    </div>
  );
}
