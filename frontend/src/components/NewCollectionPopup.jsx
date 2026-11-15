import React, { useState, useEffect, useRef } from 'react';

export default function NewCollectionPopup({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const popupRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        // Check if click was on the trigger button
        const openBtn = document.getElementById('openCollectionModalBtn');
        if (openBtn && openBtn.contains(event.target)) {
          return;
        }
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
  };

  return (
    <div
      ref={popupRef}
      className="absolute top-12 left-auto right-0 sm:left-64 z-20 w-72 bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-xl shadow-zinc-900/5"
      id="newCollectionPopup"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">New Collection</h3>
        <button
          className="text-zinc-400 hover:text-zinc-600 text-sm cursor-pointer"
          id="closeCollectionPopupBtn"
          type="button"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <form className="flex flex-col gap-2.5" id="newCollectionForm" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="w-full px-3 py-2 text-xs bg-zinc-50 border border-[#EAEAEA] rounded-xl focus:outline-none focus:border-zinc-400 focus:bg-white text-zinc-900"
          id="collectionNameInput"
          placeholder="Collection name (e.g. Design)"
          required
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 font-medium cursor-pointer"
            id="cancelCollectionBtn"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3.5 py-1.5 text-xs bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium shadow-sm cursor-pointer"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
