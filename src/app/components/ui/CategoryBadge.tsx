'use client';

import Image from 'next/image';
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
      <Image
        src={categoryIcons[category]}
        alt={CATEGORY_LABELS[category]}
        width={16}
        height={16}
        className={styles.icon}
      />
      <span className={styles.label}>
        {CATEGORY_LABELS[category].toUpperCase()}
      </span>
    </div>
  );
}
