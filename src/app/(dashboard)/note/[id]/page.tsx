'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Note, Category, CATEGORIES, CATEGORY_LABELS } from '@/lib/types/note';
import CategoryBadge from '@/app/components/ui/CategoryBadge';
import styles from './note-detail.module.css';

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteId, setNoteId] = useState<string>('');

  useEffect(() => {
    params.then((resolvedParams) => {
      setNoteId(resolvedParams.id);
      fetchNote(resolvedParams.id);
    });
  }, [params]);

  const fetchNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
        setEditedContent(data.content);
        setEditedTitle(data.title);
      } else {
        console.error('Failed to fetch note');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!note || editedContent.trim().length < 3) {
      alert('Le contenu doit contenir au moins 3 caractères');
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
          title: editedTitle,
        }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleCategoryChange = async (newCategory: Category) => {
    if (!note) return;

    setShowCategoryDropdown(false);

    // Optimistic update
    const previousNote = note;
    setNote({ ...note, category: newCategory });

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        const updatedNote = await response.json();
        setNote(updatedNote);
      } else {
        // Revert on error
        setNote(previousNote);
        const error = await response.json();
        alert(error.error || 'Erreur lors de la recatégorisation');
      }
    } catch (error) {
      // Revert on error
      setNote(previousNote);
      console.error('Error updating category:', error);
      alert('Erreur lors de la recatégorisation');
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return `le ${formatDate(dateString)}`;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement de la note...</div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/note/new" className={styles.navLink}>
            Nouvelle note
          </Link>
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
        </nav>
        <div className={styles.profile}>
          <div className={styles.profileIcon}>👤</div>
        </div>
      </header>

      <div className={styles.content}>
        <main className={styles.main}>
          <CategoryBadge category={note.category} />

          {isEditing ? (
            <input
              type="text"
              className={styles.titleInput}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Titre de la note"
            />
          ) : (
            <h1 className={styles.title}>{note.title}</h1>
          )}

          <p className={styles.metadata}>
            Édité {formatRelativeTime(note.updated_at)}
          </p>

          <div className={styles.actions}>
            {isEditing ? (
              <>
                <button
                  className={styles.saveButton}
                  onClick={handleEditSave}
                >
                  💾 Sauvegarder
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(note.content);
                    setEditedTitle(note.title);
                  }}
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Éditer la note
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️
                </button>
              </>
            )}
          </div>

          <section className={styles.contentSection}>
            <h2 className={styles.sectionTitle}>Contenu de la note</h2>

            {isEditing ? (
              <textarea
                className={styles.textarea}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
              />
            ) : (
              <div className={styles.noteContent}>{note.content}</div>
            )}
          </section>
        </main>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Métadonnées</h3>

            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Date de création :</span>
              <span className={styles.metadataValue}>
                {formatDate(note.created_at)}
              </span>
            </div>

            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>
                Dernière modification :
              </span>
              <span className={styles.metadataValue}>
                {formatRelativeTime(note.updated_at)}
              </span>
            </div>

            <div className={styles.recategorizeSection}>
              <button
                className={styles.recategorizeButton}
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                Recatégoriser la note
              </button>

              {showCategoryDropdown && (
                <div className={styles.dropdown}>
                  {Object.values(CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      className={`${styles.dropdownItem} ${
                        note.category === cat ? styles.dropdownItemActive : ''
                      }`}
                      onClick={() => handleCategoryChange(cat as Category)}
                    >
                      {CATEGORY_LABELS[cat as Category]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Êtes-vous sûr ?</h3>
            <p className={styles.modalText}>
              Cette action est irréversible. La note sera définitivement
              supprimée.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button className={styles.modalDeleteButton} onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
