import React from 'react';

export default function EmptyState() {
  return (
    <div
      className="py-16 px-6 text-center bg-white border border-[#EAEAEA] rounded-2xl max-w-md mx-auto my-6"
      id="emptyState"
    >
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
        <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect height="18" rx="2" width="18" x="3" y="3"></rect>
          <path d="m9 9 6 6"></path>
          <path d="m15 9-6 6"></path>
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 mb-1">No reels found</h3>
      <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
        No reels yet in this view. Paste a link above to save your first one or adjust your search filter.
      </p>
    </div>
  );
}
