'use client';

import { useRouter } from 'next/navigation';
import { Category } from '@/lib/types/note';
import styles from './NoteRow.module.css';

interface NoteRowProps {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  updatedAt: string;
}

const categoryColors: Record<Category, string> = {
  todo: 'var(--category-todo)',
  done: 'var(--category-done)',
  recurring: 'var(--category-recurring)',
  waiting_followup: 'var(--category-waiting)',
};

export default function NoteRow({
  id,
  title,
  excerpt,
  category,
  updatedAt,
}: NoteRowProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/note/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    }
  };

  return (
    <article className={styles.row} onClick={handleClick}>
      <div
        className={styles.colorBar}
        style={{ backgroundColor: categoryColors[category] }}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <time className={styles.date}>{formatDate(updatedAt)}</time>
        </div>
        <p className={styles.excerpt}>{excerpt}</p>
      </div>
      <div className={styles.chevron}>›</div>
    </article>
  );
}
