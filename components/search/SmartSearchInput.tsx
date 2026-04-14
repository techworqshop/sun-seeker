'use client';

import { useState, useCallback } from 'react';

export default function SmartSearchInput({
  onSearch,
  placeholder = 'Cafe, zip code, or neighborhood...',
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2 || /^\d{5}$/.test(val)) {
      onSearch(val);
    } else if (val.length === 0) {
      onSearch('');
    }
  }, [onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 bg-white/60 rounded-xl text-sm text-sun-earth placeholder:text-sun-muted/50 border border-white/40 focus:outline-none focus:bg-white/80 focus:border-sun-peach transition-all"
      />
      <button type="submit" className="w-10 h-10 flex items-center justify-center bg-sun-amber hover:bg-sun-coral text-white rounded-xl transition-colors shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
