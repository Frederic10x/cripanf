"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Note, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types/note";
import MobileNav from "@/app/components/ui/MobileNav";
import { createClient } from "@/lib/supabase/client";
import EditIcon from "@/app/components/icons/EditIcon";
import TodosIcon from "@/app/components/icons/TodosIcon";
import DoneIcon from "@/app/components/icons/DoneIcon";
import RecurringIcon from "@/app/components/icons/RecurringIcon";
import WaitingFollowupIcon from "@/app/components/icons/WaitingFollowupIcon";
import styles from "./note-detail.module.css";

const icons = {
  todo: { label: "À faire", icon: TodosIcon },
  done: { label: "Fait", icon: DoneIcon },
  recurring: {
    label: "Tâches cycliques",
    icon: RecurringIcon,
  },
  waiting_followup: {
    label: "Attente de retour",
    icon: WaitingFollowupIcon,
  },
};

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteId, setNoteId] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setNoteId(resolvedParams.id);
      fetchNote(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const fetchNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setNote(data);
        setEditedContent(data.content);
        setEditedTitle(data.title);
      } else {
        console.error("Failed to fetch note");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching note:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!note || editedContent.trim().length < 3) {
      alert("Le contenu doit contenir au moins 3 caractères");
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
        alert(error.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleRecategorize = async () => {
    if (!note) return;

    setIsRecategorizing(true);
    setShowCategoryDropdown(false);

    try {
      // Call categorize API with note content
      const categorizeResponse = await fetch("/api/categorize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: note.content }),
      });

      if (!categorizeResponse.ok) {
        throw new Error("Failed to categorize");
      }

      const { category, title, insights } = await categorizeResponse.json();

      // Update note with new category and insights
      const updateResponse = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          title,
          insights,
        }),
      });

      if (updateResponse.ok) {
        const updatedNote = await updateResponse.json();
        setNote(updatedNote);
        setEditedTitle(updatedNote.title);
      } else {
        throw new Error("Failed to update note");
      }
    } catch (error) {
      console.error("Error recategorizing:", error);
      alert("Erreur lors de la recatégorisation");
    } finally {
      setIsRecategorizing(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return "à l'instant";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${diffHours} h`;
    } else if (diffDays < 7) {
      return `${diffDays} j`;
    } else {
      return formatDate(dateString);
    }
  };

  const renderInsightsText = () => {
    if (!note?.insights || note.insights.length === 0) return null;

    const insightsText = note.insights.join(", ");
    const parts = insightsText.split(/(,\s*)/);

    return (
      <span>
        En se basant sur le contenu de votre note, il semble que les éléments
        importants soient :{" "}
        {parts.map((part, index) => {
          if (part.match(/,\s*/)) {
            return part;
          }
          return <strong key={index}>{part}</strong>;
        })}
        .
      </span>
    );
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

  const Icon = icons[note.category].icon;

  return (
    <>
      <div className={styles.container}>
        {/* Desktop Header */}
        <header className={styles.header}>
          <nav className={styles.nav}>
            <Link href="/note/new" className={styles.navLink}>
              Nouvelle note
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          </nav>
          <div className={styles.profile} ref={profileMenuRef}>
            <Image
              src="/svg/profile.svg"
              alt="Profile"
              width={32}
              height={32}
              className={styles.profileIcon}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: "pointer" }}
            />
            {showProfileMenu && (
              <div className={styles.profileMenu}>
                <button
                  className={styles.profileMenuItem}
                  onClick={handleLogout}
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Header */}
        <header className={styles.mobileHeader}>
          <Link href="/dashboard" className={styles.mobileHeaderLogo}>
            Cripan<mark>f</mark>
          </Link>
        </header>

        <div className={styles.content}>
          <main className={styles.main}>
            {isEditing ? (
              // Edit mode
              <>
                <input
                  type="text"
                  className={styles.titleInput}
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Titre de la note"
                />
                <textarea
                  className={styles.textarea}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={15}
                  placeholder="Contenu de la note"
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleEditSave}
                  >
                    Sauvegarder
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
                </div>
              </>
            ) : (
              // View mode
              <>
                {/* Header section with category badge and actions */}
                <div className={styles.noteHeaderTop}>
                  <button
                    className={styles.editButtonNew}
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon className={styles.editIcon} />
                    <span>ÉDITER</span>
                  </button>
                  <button
                    className={styles.deleteButtonNew}
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Image
                      src="/svg/bin.svg"
                      alt="Supprimer"
                      width={14}
                      height={14}
                    />
                    <span>SUPPRIMER</span>
                  </button>
                </div>
                <div className={styles.noteHeaderBottom}>
                  <div className={`${styles.categoryBadge} ${styles[note.category]}`}>
                    <Icon className={`${styles.categoryIcon} ${styles[note.category]}`} />
                    <span>{icons[note.category].label.toUpperCase()}</span>
                  </div>
                  <div className={styles.noteMetadata}>
                    <Image
                      src="/svg/calendar.svg"
                      alt="Calendar"
                      width={14}
                      height={14}
                    />
                    <span>Créé le {formatDate(note.created_at)}</span>
                    <span className={styles.separator}>•</span>
                    <span>
                      Modifié il y a {formatRelativeTime(note.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className={styles.noteTitle}>{note.title}</h1>

                {/* Content */}
                <div className={styles.noteContentText}>{note.content}</div>

                {/* AI Insights */}
                {note.insights && note.insights.length > 0 && (
                  <div className={styles.insightsBlock}>
                    <div className={styles.insightsHeader}>
                      <Image
                        src="/svg/ai.svg"
                        alt="AI"
                        width={20}
                        height={20}
                      />
                      <span className={styles.insightsLabel}>
                        INSIGHT DE L&apos;IA
                      </span>
                    </div>
                    <p className={styles.insightsText}>
                      {renderInsightsText()}
                    </p>
                  </div>
                )}

                {/* Current Category Section */}
                <div className={styles.categorySection}>
                  <div className={styles.currentCategory}>
                    <Icon className={`${styles.currentIcon} ${styles[note.category]}`} />
                    Catégorie actuelle :
                    <span>{CATEGORY_LABELS[note.category]}</span>
                  </div>
                  <button
                    className={styles.recategorizeButtonNew}
                    onClick={handleRecategorize}
                    disabled={isRecategorizing}
                  >
                    <RecurringIcon className={styles.recategorizeIcon} />
                    <span>
                      {isRecategorizing
                        ? "RECATÉGORISATION..."
                        : "RECATÉGORISER"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </main>
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
                <button
                  className={styles.modalDeleteButton}
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
}
