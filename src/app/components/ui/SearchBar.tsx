'use client';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
}

export default function SearchBar({
  placeholder = 'Rechercher une note',
  onSearch,
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs]);

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
