import React, { useState, useEffect } from 'react';
import {
  getGradientForId,
  getCollectionTagStyle,
  formatDate,
  formatDuration,
} from '../utils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ReelCard({ reel, onClick, onDelete }) {
  const fallbackUrl = reel.fallback_thumbnail
    ? `${API_BASE}${reel.fallback_thumbnail}`
    : null;

  const [currentThumb, setCurrentThumb] = useState(reel.thumbnail || fallbackUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setCurrentThumb(reel.thumbnail || fallbackUrl);
    setImgError(false);
  }, [reel.thumbnail, reel.fallback_thumbnail]);

  const handleImgError = () => {
    if (fallbackUrl && currentThumb !== fallbackUrl) {
      setCurrentThumb(fallbackUrl);
    } else {
      setImgError(true);
    }
  };

  const gradient = getGradientForId(reel.id || reel._id);
  const collectionName = reel.collection || 'General';
  const tagStyle = getCollectionTagStyle(collectionName);
  const formattedDate = formatDate(reel.created_at);
  const durationText = formatDuration(reel.duration);

  // Extract uploader from uploader prop or title "Video by xyz"
  const uploader =
    reel.uploader ||
    (reel.title && reel.title.startsWith('Video by ')
      ? reel.title.replace('Video by ', '').trim()
      : null);

  const title = reel.title || 'Untitled Reel';
  const summary = reel.summary || 'Summary will appear after processing.';
  const hasRealThumbnail = Boolean(currentThumb) && !imgError;

  return (
    <article
      onClick={() => onClick && onClick(reel)}
      className="reel-card group bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden card-transition flex flex-col cursor-pointer relative"
      data-collection={collectionName.toLowerCase()}
      data-summary={summary}
      data-title={title}
    >
      <div className={`relative aspect-[9/12] w-full bg-gradient-to-br ${gradient} overflow-hidden flex items-center justify-center`}>
        {hasRealThumbnail ? (
          <>
            <img
              src={currentThumb}
              alt={title}
              referrerPolicy="no-referrer"
              onError={handleImgError}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Subtle top & bottom vignette so duration, play icon, and uploader remain legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none"></div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
            <svg className="w-10 h-10 mb-1" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect height="18" rx="2" width="18" x="3" y="3" />
              <path d="M7 3v18M3 7.5h4M3 12h18M3 16.5h4M17 3v18M17 7.5h4M17 16.5h4" />
            </svg>
          </div>
        )}

        {/* Play badge / Processing indicator & duration */}
        {reel.status === 'processing' ? (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-amber-500/90 text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-sm z-10 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Processing AI...
          </span>
        ) : durationText ? (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-black/50 backdrop-blur-md text-white border border-white/10 z-10">
            {durationText}
          </span>
        ) : null}

        {/* Delete option button (top-right) */}
        {onDelete ? (
          <button
            type="button"
            title="Delete reel"
            aria-label="Delete reel"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(reel);
            }}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-red-600/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 hover:border-red-500/50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : null}

        {/* Center play icon button */}
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 shadow-lg transition-transform z-10">
          <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>

        {/* Handle @uploader */}
        {uploader ? (
          <span className="absolute bottom-3 right-3 text-[10px] text-zinc-200 font-mono drop-shadow z-10">
            @{uploader}
          </span>
        ) : null}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${tagStyle}`}>
              {collectionName}
            </span>
            <span className="text-[11px] text-zinc-400">{formattedDate}</span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 tracking-tight leading-snug mb-1 group-hover:text-black">
            {title}
          </h2>
          {reel.status === 'processing' ? (
            <p className="text-xs text-amber-600 line-clamp-2 leading-relaxed flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Analyzing scenes & speech in background...</span>
            </p>
          ) : (
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
