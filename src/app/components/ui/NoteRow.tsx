'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Category, CATEGORY_LABELS } from '@/lib/types/note';
import TodosIcon from '@/app/components/icons/TodosIcon';
import DoneIcon from '@/app/components/icons/DoneIcon';
import RecurringIcon from '@/app/components/icons/RecurringIcon';
import WaitingFollowupIcon from '@/app/components/icons/WaitingFollowupIcon';
import styles from './NoteRow.module.css';

interface NoteRowProps {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  updatedAt: string;
  onUpdate?: () => void;
}

const categoryColors: Record<Category, string> = {
  todo: 'var(--category-todo)',
  done: 'var(--category-done)',
  recurring: 'var(--category-recurring)',
  waiting_followup: 'var(--category-waiting)',
};

const categoryIcons = {
  todo: TodosIcon,
  done: DoneIcon,
  recurring: RecurringIcon,
  waiting_followup: WaitingFollowupIcon,
};

export default function NoteRow({
  id,
  title,
  excerpt,
  category,
  updatedAt,
  onUpdate,
}: NoteRowProps) {
  const router = useRouter();
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const rowRef = useRef<HTMLElement>(null);
  const swipeThreshold = 60;
  const maxSwipe = 160;

  // Close other revealed rows when this one opens
  useEffect(() => {
    const handleCloseOthers = (e: CustomEvent) => {
      if (e.detail.id !== id && isRevealed) {
        setIsRevealed(false);
        setTranslateX(0);
      }
    };

    window.addEventListener('noterow-reveal' as any, handleCloseOthers);
    return () => {
      window.removeEventListener('noterow-reveal' as any, handleCloseOthers);
    };
  }, [id, isRevealed]);

  // Handle ESC key and prevent body scroll when modals are open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteModal) {
          setShowDeleteModal(false);
        } else if (showCategorySheet) {
          setShowCategorySheet(false);
        } else if (isRevealed) {
          setIsRevealed(false);
          setTranslateX(0);
        }
      }
    };

    if (showDeleteModal || showCategorySheet) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else if (isRevealed) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showDeleteModal, showCategorySheet, isRevealed]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.innerWidth >= 768 || !isSwiping) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX.current - currentX;
    const diffY = Math.abs(touchStartY.current - currentY);

    // Ignore if this is a vertical scroll
    if (diffY > Math.abs(diffX) && diffY > 10) {
      setIsSwiping(false);
      // Don't reset translateX if already revealed
      if (!isRevealed) {
        setTranslateX(0);
      }
      return;
    }

    // Swipe left to reveal actions
    if (diffX > 0) {
      const newTranslateX = Math.min(diffX, maxSwipe);
      setTranslateX(newTranslateX);
    }
    // Swipe right to close actions
    else if (diffX < -30 && isRevealed) {
      setIsRevealed(false);
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    if (window.innerWidth >= 768 || !isSwiping) return;

    setIsSwiping(false);

    if (translateX > swipeThreshold) {
      // Reveal actions
      setTranslateX(maxSwipe);
      setIsRevealed(true);

      // Notify other rows to close
      window.dispatchEvent(new CustomEvent('noterow-reveal', { detail: { id } }));
    } else {
      // Reset
      setTranslateX(0);
      setIsRevealed(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Close revealed actions on click
    if (isRevealed) {
      e.stopPropagation();
      setIsRevealed(false);
      setTranslateX(0);
      return;
    }

    // Prevent navigation if just finished swiping
    const timeSinceStart = Date.now() - touchStartTime.current;
    if (timeSinceStart < 300 && translateX > 0) {
      return;
    }

    router.push(`/note/${id}`);
  };

  const handleRecategorize = () => {
    setIsRevealed(false);
    setTranslateX(0);
    setShowCategorySheet(true);
  };

  const handleDelete = () => {
    setIsRevealed(false);
    setTranslateX(0);
    setShowDeleteModal(true);
  };

  const handleCategoryChange = async (newCategory: Category) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        setShowCategorySheet(false);
        onUpdate?.();
      } else {
        alert('Erreur lors de la mise à jour de la catégorie');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Erreur lors de la mise à jour de la catégorie');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        onUpdate?.();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erreur lors de la suppression');
    }
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
    <>
      <div className={styles.swipeContainer}>
        <article
          ref={rowRef}
          className={styles.row}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translateX(-${translateX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
            willChange: isSwiping ? 'transform' : 'auto',
          }}
        >
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

        <div
          className={styles.actionsContainer}
          style={{
            opacity: translateX > 0 || isRevealed ? 1 : 0,
            pointerEvents: translateX > swipeThreshold / 2 || isRevealed ? 'auto' : 'none',
          }}
        >
          <button
            className={styles.recategorizeButton}
            onClick={handleRecategorize}
            aria-label="Recatégoriser la note"
          >
            <RecurringIcon className={styles.actionIcon} />
            <span>Recatégoriser</span>
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            aria-label="Supprimer la note"
          >
            <svg
              className={styles.actionIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Supprimer</span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet - Category Selection */}
      {showCategorySheet && (
        <div className={styles.bottomSheetOverlay} onClick={() => setShowCategorySheet(false)}>
          <div
            className={styles.bottomSheet}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-sheet-title"
          >
            <div className={styles.bottomSheetHandle} />
            <h3 id="category-sheet-title" className={styles.bottomSheetTitle}>
              Choisir une catégorie
            </h3>
            <div className={styles.categoryList}>
              {(Object.keys(categoryIcons) as Category[]).map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <button
                    key={cat}
                    className={`${styles.categoryButton} ${styles[`category-${cat}`]}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    <Icon className={styles.categoryIcon} />
                    <span>{CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
          >
            <h3 id="delete-modal-title" className={styles.modalTitle}>
              Supprimer la note ?
            </h3>
            <p id="delete-modal-description" className={styles.modalDescription}>
              Cette action est irréversible.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className={styles.modalDeleteButton}
                onClick={handleConfirmDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
