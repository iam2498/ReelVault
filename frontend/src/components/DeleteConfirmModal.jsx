import React from 'react';

export default function DeleteConfirmModal({
  isOpen,
  reel,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !reel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade">
      <div
        className="w-full max-w-sm bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-2xl shadow-zinc-900/10 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
              Delete this reel?
            </h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              This will permanently remove the video, audio, extracted frames, transcript, and search data for this reel.
            </p>
          </div>
        </div>

        {/* Reel title preview */}
        <div className="p-2.5 mb-4 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-700 font-medium truncate">
          {reel.title || 'Untitled Reel'}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-[#EAEAEA] rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete reel</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
