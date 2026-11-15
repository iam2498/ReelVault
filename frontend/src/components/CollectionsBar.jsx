import React, { useState } from 'react';
import NewCollectionPopup from './NewCollectionPopup';

export default function CollectionsBar({
  collections,
  activeCollection,
  onSelectCollection,
  totalCount,
  filteredCount,
  isSearching,
  onCreateCollection,
}) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCreate = (name) => {
    onCreateCollection(name);
    setIsPopupOpen(false);
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" id="collectionsBar">
          {/* All pill */}
          <button
            className={`collection-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
              activeCollection.toLowerCase() === 'all'
                ? 'active bg-zinc-900 text-white'
                : 'bg-white border border-[#EAEAEA] text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
            }`}
            data-collection="all"
            type="button"
            onClick={() => onSelectCollection('all')}
          >
            All (<span id="countAll">{totalCount}</span>)
          </button>

          {/* Collection pills */}
          {collections.map((col) => {
            const isActive = activeCollection.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={col}
                className={`collection-pill px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 shrink-0 cursor-pointer ${
                  isActive
                    ? 'active bg-zinc-900 text-white'
                    : 'bg-white border border-[#EAEAEA] text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
                data-collection={col.toLowerCase()}
                type="button"
                onClick={() => onSelectCollection(col)}
              >
                {col}
              </button>
            );
          })}

          {/* + New Collection Button */}
          <button
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 bg-transparent border border-dashed border-zinc-300 text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 flex items-center gap-1.5 shrink-0 cursor-pointer"
            id="openCollectionModalBtn"
            type="button"
            onClick={() => setIsPopupOpen((prev) => !prev)}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            New collection
          </button>
        </div>

        <span className="text-xs text-zinc-400 font-medium hidden sm:inline-block" id="resultsCount">
          {isSearching
            ? `${filteredCount} result${filteredCount === 1 ? '' : 's'}`
            : `${filteredCount} reel${filteredCount === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* New Collection Modal */}
      <NewCollectionPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onCreate={handleCreate}
      />
    </section>
  );
}
