"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SearchBar from "../../components/ui/SearchBar";
import NoteCard from "../../components/ui/NoteCard";
import NoteRow from "../../components/ui/NoteRow";
import MobileNav from "../../components/ui/MobileNav";
import { useDashboard } from "../DashboardContext";
import { Note, Category } from "@/lib/types/note";
import { createClient } from "@/lib/supabase/client";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCategory, setSelectedCategory } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<Category | null>(null);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory, searchQuery, mobileCategory, sortOrder]);

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

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by category (desktop or mobile)
    const activeCategory = mobileCategory || selectedCategory;
    if (activeCategory) {
      filtered = filtered.filter((note) => note.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query),
      );
    }

    // Sort by creation date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotes(filtered);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const getExcerpt = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const handleMobileCategoryChange = (category: Category | null) => {
    setMobileCategory(category);
  };

  const handleSearchModalOpen = () => {
    setIsSearchModalOpen(true);
  };

  const handleSearchModalClose = () => {
    setIsSearchModalOpen(false);
    setSearchQuery("");
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

  const categories: { id: string; label: string; value: Category | null }[] = [
    { id: "all", label: "Toutes", value: null },
    { id: "todo", label: "À faire", value: "todo" },
    { id: "done", label: "Fait", value: "done" },
    { id: "recurring", label: "Tâches cycliques", value: "recurring" },
    { id: "waiting", label: "Attente", value: "waiting_followup" },
  ];

  const getCategoryColor = (category: Category | null): string => {
    switch (category) {
      case "todo":
        return "var(--category-todo)";
      case "done":
        return "var(--category-done)";
      case "recurring":
        return "var(--category-recurring)";
      case "waiting_followup":
        return "var(--category-waiting)";
      default:
        return "var(--color-primary)";
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des notes...</div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        {/* Desktop Header */}
        <header className={styles.header}>
          <div className={styles.searchWrapper}>
            <SearchBar onSearch={handleSearch} />
          </div>
          <nav className={styles.nav}>
            <Link href="/note/new" className={styles.navLink}>
              Nouvelle note
            </Link>
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
          </nav>
          <div className={styles.profile} ref={profileMenuRef}>
            <img
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
          <button
            className={styles.mobileHeaderSearch}
            onClick={handleSearchModalOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.1322 17.4927L10.0097 11.3703C9.52381 11.759 8.96502 12.0667 8.33333 12.2935C7.70165 12.5203 7.02948 12.6336 6.31681 12.6336C4.55135 12.6336 3.05718 12.0222 1.83431 10.7993C0.611435 9.57646 0 8.08229 0 6.31682C0 4.55135 0.611435 3.05718 1.83431 1.83431C3.05718 0.611443 4.55135 7.62939e-06 6.31681 7.62939e-06C8.08228 7.62939e-06 9.57645 0.611443 10.7993 1.83431C12.0222 3.05718 12.6336 4.55135 12.6336 6.31682C12.6336 7.02949 12.5202 7.70166 12.2935 8.33334C12.0667 8.96502 11.759 9.52382 11.3703 10.0097L17.4927 16.1322L16.1322 17.4927ZM6.31681 10.69C7.53159 10.69 8.56414 10.2648 9.41448 9.41449C10.2648 8.56415 10.69 7.53159 10.69 6.31682C10.69 5.10205 10.2648 4.06949 9.41448 3.21915C8.56414 2.36881 7.53159 1.94364 6.31681 1.94364C5.10204 1.94364 4.06949 2.36881 3.21915 3.21915C2.3688 4.06949 1.94363 5.10205 1.94363 6.31682C1.94363 7.53159 2.3688 8.56415 3.21915 9.41449C4.06949 10.2648 5.10204 10.69 6.31681 10.69Z"
                fill="#8D6A5E"
              />
            </svg>
          </button>
        </header>

        {/* Desktop Title Section */}
        <section className={styles.titleSection}>
          <div className={styles.titleContent}>
            <h1 className={styles.title}>Notes récentes</h1>
            <p className={styles.subtitle}>Catégorisées par l'IA</p>
          </div>
          <div className={styles.actions}>
            <div className={styles.actionWrapper}>
              <button
                className={styles.actionButton}
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <span>⇅</span>
                <span>Trier</span>
              </button>
              {showSortMenu && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={`${styles.dropdownItem} ${sortOrder === "desc" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setSortOrder("desc");
                      setShowSortMenu(false);
                    }}
                  >
                    Plus récent
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${sortOrder === "asc" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setSortOrder("asc");
                      setShowSortMenu(false);
                    }}
                  >
                    Plus ancien
                  </button>
                </div>
              )}
            </div>
            <div className={styles.actionWrapper}>
              <button
                className={styles.actionButton}
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              >
                <span>⊞</span>
                <span>Présentation</span>
              </button>
              {showLayoutMenu && (
                <div className={styles.dropdownMenu}>
                  <button
                    className={`${styles.dropdownItem} ${layout === "grid" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setLayout("grid");
                      setShowLayoutMenu(false);
                    }}
                  >
                    Grille
                  </button>
                  <button
                    className={`${styles.dropdownItem} ${layout === "list" ? styles.dropdownItemActive : ""}`}
                    onClick={() => {
                      setLayout("list");
                      setShowLayoutMenu(false);
                    }}
                  >
                    Liste
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile Title Section */}
        <section className={styles.mobileTitleSection}>
          <h1 className={styles.title}>Mes notes</h1>
          <p className={styles.subtitle}>Catégorisées par l'IA</p>
        </section>

        {/* Mobile Category Pills */}
        <div className={styles.categoryPills}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryPill} ${
                mobileCategory === cat.value ? styles.categoryPillActive : ""
              }`}
              style={
                mobileCategory === cat.value
                  ? { backgroundColor: getCategoryColor(cat.value) }
                  : {}
              }
              onClick={() => handleMobileCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredNotes.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>
              {searchQuery || selectedCategory || mobileCategory
                ? "Aucune note trouvée"
                : "Aucune note pour le moment"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Content - Grid or List */}
            {layout === "grid" ? (
              <div className={styles.grid}>
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    excerpt={getExcerpt(note.content)}
                    category={note.category}
                    updatedAt={note.updated_at}
                    onUpdate={fetchNotes}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.desktopList}>
                {filteredNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    excerpt={getExcerpt(note.content, 80)}
                    category={note.category}
                    updatedAt={note.updated_at}
                  />
                ))}
              </div>
            )}

            {/* Mobile List */}
            <div className={styles.mobileList}>
              {filteredNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  excerpt={getExcerpt(note.content, 80)}
                  category={note.category}
                  updatedAt={note.updated_at}
                />
              ))}
            </div>
          </>
        )}

        {/* Desktop FAB */}
        <Link href="/note/new" className={styles.fab}>
          +
        </Link>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Search Modal */}
      <div
        className={`${styles.searchModal} ${
          isSearchModalOpen ? styles.searchModalActive : ""
        }`}
      >
        <div className={styles.searchModalHeader}>
          <input
            type="text"
            className={styles.searchModalInput}
            placeholder="Rechercher une note..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          <button
            className={styles.searchModalClose}
            onClick={handleSearchModalClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.searchModalResults}>
          {searchQuery.trim() && (
            <div className={styles.mobileList}>
              {filteredNotes.map((note) => (
                <NoteRow
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  excerpt={getExcerpt(note.content, 80)}
                  category={note.category}
                  updatedAt={note.updated_at}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
