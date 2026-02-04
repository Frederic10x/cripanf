"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SearchBar from "../../components/ui/SearchBar";
import NoteCard from "../../components/ui/NoteCard";
import NoteRow from "../../components/ui/NoteRow";
import MobileNav from "../../components/ui/MobileNav";
import { useDashboard } from "../DashboardContext";
import { Note, Category } from "@/lib/types/note";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCategory, setSelectedCategory } = useDashboard();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mobileCategory, setMobileCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory, searchQuery, mobileCategory]);

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

    setFilteredNotes(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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

  const categories: { id: string; label: string; value: Category | null }[] = [
    { id: "all", label: "Toutes", value: null },
    { id: "todo", label: "À faire", value: "todo" },
    { id: "done", label: "Fait", value: "done" },
    { id: "recurring", label: "Tâches cycliques", value: "recurring" },
    { id: "waiting", label: "Attente", value: "waiting_followup" },
  ];

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
          <div className={styles.profile}>
            <img
              src="/svg/profile.svg"
              alt="Profile"
              width={32}
              height={32}
              className={styles.profileIcon}
            />
          </div>
        </header>

        {/* Mobile Header */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileHeaderLogo}>
            Cripan<mark>f</mark>
          </div>
          <button
            className={styles.mobileHeaderSearch}
            onClick={handleSearchModalOpen}
          >
            🔍
          </button>
        </header>

        {/* Desktop Title Section */}
        <section className={styles.titleSection}>
          <div className={styles.titleContent}>
            <h1 className={styles.title}>Notes récentes</h1>
            <p className={styles.subtitle}>Catégorisées par l'IA</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.actionButton}>
              <span>⇅</span>
              <span>Trier</span>
            </button>
            <button className={styles.actionButton}>
              <span>⊞</span>
              <span>Présentation</span>
            </button>
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
            {/* Desktop Grid */}
            <div className={styles.grid}>
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  excerpt={getExcerpt(note.content)}
                  category={note.category}
                  updatedAt={note.updated_at}
                />
              ))}
            </div>

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
      <MobileNav onSearchClick={handleSearchModalOpen} />

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
