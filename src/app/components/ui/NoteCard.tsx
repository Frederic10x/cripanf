'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/types/note';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  updatedAt: string;
  onUpdate?: () => void;
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
  onUpdate,
}: NoteCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const handleClick = () => {
    router.push(`/note/${id}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRecategorize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCategoryMenu(true);
    setShowMenu(false);
  };

  const handleCategoryChange = async (e: React.MouseEvent, newCategory: Category) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        setShowCategoryMenu(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error('Failed to update note category');
      }
    } catch (error) {
      console.error('Error updating note category:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowMenu(false);
        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
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
          <span className={styles.badgeIcon}>{CATEGORY_ICONS[category]}</span>
          {categoryLabels[category]}
        </span>
        <div className={styles.menuWrapper}>
          <button className={styles.menu} onClick={handleMenuClick}>
            ⋯
          </button>
          {showMenu && (
            <div className={styles.contextMenu}>
              <button className={styles.contextMenuItem} onClick={handleRecategorize}>
                Recatégoriser
              </button>
              <button className={styles.contextMenuItem} onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          )}
          {showCategoryMenu && (
            <div className={styles.contextMenu}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  className={`${styles.contextMenuItem} ${cat === category ? styles.contextMenuItemActive : ""}`}
                  onClick={(e) => handleCategoryChange(e, cat)}
                >
                  <span className={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.excerpt}>{excerpt}</p>

      <time className={styles.date}>{formatDate(updatedAt)}</time>
    </article>
  );
}
