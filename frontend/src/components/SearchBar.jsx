import React, { useRef } from 'react';

export default function SearchBar({ value, onChange, onClear }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-72 sm:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
        </svg>
      </div>
      <input
        ref={inputRef}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-[#EAEAEA] rounded-full focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400 text-zinc-800 shadow-sm"
        id="searchInput"
        placeholder="Search your reels…"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
          id="clearSearchBtn"
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>
      ) : null}
    </div>
  );
}
