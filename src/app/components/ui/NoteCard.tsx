'use client';

import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types/note';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  updatedAt: string;
}

const categoryLabels: Record<Category, string> = {
  todo: 'À faire',
  done: 'Fait',
  recurring: 'Cyclique',
  waiting_followup: 'En attente',
};

export default function NoteCard({
  id,
  title,
  excerpt,
  category,
  updatedAt,
}: NoteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/note/${id}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open menu
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `Mise à jour il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Mise à jour il y a ${diffDays}j`;
    } else {
      return `Mise à jour le ${date.toLocaleDateString('fr-FR')}`;
    }
  };

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <span className={`${styles.badge} ${getBadgeClass()}`}>
          {categoryLabels[category]}
        </span>
        <button className={styles.menu} onClick={handleMenuClick}>
          ⋯
        </button>
      </div>

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.excerpt}>{excerpt}</p>

      <time className={styles.date}>{formatDate(updatedAt)}</time>
    </article>
  );
}
