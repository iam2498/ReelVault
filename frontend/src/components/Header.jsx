import React from 'react';
import SearchBar from './SearchBar';

export default function Header({ searchQuery, onSearchChange, onSearchClear }) {
  return (
    <header className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#EAEAEA]">
      <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a className="flex items-center gap-2.5 group cursor-pointer" href="#">
          <div className="w-8 h-8 rounded-xl ig-gradient flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform duration-150">
            {/* Film Reel / Bookmark Icon */}
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <rect height="18" rx="2" width="18" x="3" y="3"></rect>
              <path d="M7 3v18"></path>
              <path d="M3 7.5h4"></path>
              <path d="M3 12h18"></path>
              <path d="M3 16.5h4"></path>
              <path d="M17 3v18"></path>
              <path d="M17 7.5h4"></path>
              <path d="M17 16.5h4"></path>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            Reel<span className="ig-gradient-text">Vault</span>
          </span>
        </a>
        {/* Search box */}
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />
      </div>
    </header>
  );
}
