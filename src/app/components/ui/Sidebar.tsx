"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Sidebar.module.css";
import AllNotesIcon from "../icons/AllNotesIcon";
import TodosIcon from "../icons/TodosIcon";
import DoneIcon from "../icons/DoneIcon";
import RecurringIcon from "../icons/RecurringIcon";
import WaitingFollowupIcon from "../icons/WaitingFollowupIcon";

interface UserTag {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface SidebarProps {
  onCategoryChange?: (category: string | null) => void;
  onTagsChange?: (tags: string[]) => void;
}

export default function Sidebar({
  onCategoryChange,
  onTagsChange,
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState("all");
  const [tags, setTags] = useState<UserTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<UserTag | null>(null);

  useEffect(() => {
    fetchTags();

    // Écouter l'événement de création de tag
    const handleTagCreated = () => {
      fetchTags();
    };

    window.addEventListener("tag-created", handleTagCreated);

    return () => {
      window.removeEventListener("tag-created", handleTagCreated);
    };
  }, []);

  async function fetchTags() {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  }

  const handleItemClick = (id: string, category: string | null) => {
    setActiveItem(id);
    setSelectedTags([]);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    if (onTagsChange) {
      onTagsChange([]);
    }
  };

  const handleTagClick = (tagName: string) => {
    let newSelectedTags: string[];
    if (selectedTags.includes(tagName)) {
      newSelectedTags = selectedTags.filter((t) => t !== tagName);
    } else {
      newSelectedTags = [...selectedTags, tagName];
    }
    setSelectedTags(newSelectedTags);
    if (onTagsChange) {
      onTagsChange(newSelectedTags);
    }
  };

  const handleDeleteClick = (tag: UserTag, e: React.MouseEvent) => {
    e.stopPropagation();
    setTagToDelete(tag);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      const response = await fetch(`/api/tags/${tagToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTags(tags.filter((t) => t.id !== tagToDelete.id));
        setSelectedTags(selectedTags.filter((t) => t !== tagToDelete.name));
        if (onTagsChange && selectedTags.includes(tagToDelete.name)) {
          const newSelectedTags = selectedTags.filter(
            (t) => t !== tagToDelete.name,
          );
          onTagsChange(newSelectedTags);
        }
        setShowDeleteModal(false);
        setTagToDelete(null);
      } else {
        const error = await response.json();
        alert(error.error || "Erreur lors de la suppression du tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert("Erreur lors de la suppression du tag");
    }
  };

  const menuItems = [
    {
      id: "all",
      label: "Toutes les notes",
      icon: AllNotesIcon,
      category: null,
    },
    { id: "todo", label: "À faire", icon: TodosIcon, category: "todo" },
    { id: "done", label: "Fait", icon: DoneIcon, category: "done" },
    {
      id: "recurring",
      label: "Tâches cycliques",
      icon: RecurringIcon,
      category: "recurring",
    },
    {
      id: "waiting",
      label: "Attente de retour",
      icon: WaitingFollowupIcon,
      category: "waiting_followup",
    },
  ];

  return (
    <aside className={styles.sidebar}>
      <Link href="/dashboard" className={styles.logo}>
        <Image
          src="/svg/app.svg"
          alt="Cripan'"
          width={32}
          height={32}
          className={styles.logoIcon}
        />
        <span className={styles.logoText}>
          Cripan<mark>f</mark>
        </span>
      </Link>

      <nav className={styles.section}>
        <h2 className={styles.sectionTitle}>Espace de travail</h2>
        <ul className={styles.list}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`${styles.item} ${
                    activeItem === item.id ? styles.itemActive : ""
                  }`}
                  onClick={() => handleItemClick(item.id, item.category)}
                  data-category={item.category}
                >
                  <IconComponent className={styles.itemIcon} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className={styles.section}>
        <h2 className={styles.sectionTitle}>Tags</h2>
        <div className={styles.tagsList}>
          {tags.length === 0 ? (
            <p className={styles.noTagsText}>Aucun tag</p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className={`${styles.tagItem} ${
                  selectedTags.includes(tag.name) ? styles.tagItemActive : ""
                }`}
                onClick={() => handleTagClick(tag.name)}
                onMouseEnter={() => setHoveredTag(tag.id)}
                onMouseLeave={() => setHoveredTag(null)}
              >
                <span className={styles.tagName}>#{tag.name}</span>
                {hoveredTag === tag.id && (
                  <Image
                    src="/svg/bin.svg"
                    alt="Delete"
                    width={14}
                    height={14}
                    className={styles.tagDeleteIcon}
                    onClick={(e) => handleDeleteClick(tag, e)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </nav>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Supprimer le tag ?</h3>
            <p className={styles.modalText}>
              Le tag &quot;{tagToDelete?.name}&quot; sera supprimé de toutes les
              notes qui l&apos;utilisent.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setTagToDelete(null);
                }}
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
    </aside>
  );
}
