import React, { useState } from 'react';
import SaveToast from './SaveToast';

export default function AddReelForm({ onSave, isSaving, toast }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || isSaving) return;
    onSave(trimmed, () => setUrl(''));
  };

  return (
    <section className="max-w-2xl mx-auto w-full text-center">
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
        Save any reel, search anytime
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        Archive Instagram reels with instant summaries and topic tags.
      </p>
      <form
        className="flex flex-col sm:flex-row gap-2.5 p-1.5 bg-white border border-[#EAEAEA] rounded-2xl shadow-sm focus-within:border-zinc-400 transition-all"
        id="addReelForm"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1 flex items-center">
          <svg
            className="w-4 h-4 text-zinc-400 ml-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <input
            className="w-full px-3 py-2 text-sm bg-transparent border-0 focus:outline-none placeholder:text-zinc-400 text-zinc-800"
            id="reelUrlInput"
            placeholder="Paste Instagram reel link"
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSaving}
          />
        </div>
        <button
          className="ig-gradient hover:opacity-95 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all duration-150 shadow-sm shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          id="saveReelBtn"
          type="submit"
          disabled={isSaving}
        >
          <span>{isSaving ? 'Saving...' : 'Save reel'}</span>
        </button>
      </form>
      <SaveToast toast={toast} />
    </section>
  );
}
