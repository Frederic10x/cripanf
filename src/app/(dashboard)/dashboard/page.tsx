'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SearchBar from '../../components/ui/SearchBar';
import NoteCard from '../../components/ui/NoteCard';
import { useDashboard } from '../DashboardContext';
import { Note } from '@/lib/types/note';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCategory } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, selectedCategory, searchQuery]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    setFilteredNotes(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getExcerpt = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Chargement des notes...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <SearchBar onSearch={handleSearch} />
      </header>

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

      {filteredNotes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📝</div>
          <p className={styles.emptyText}>
            {searchQuery || selectedCategory
              ? 'Aucune note trouvée'
              : 'Aucune note pour le moment'}
          </p>
        </div>
      ) : (
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
      )}

      <Link href="/note/new" className={styles.fab}>
        +
      </Link>
    </div>
  );
}
