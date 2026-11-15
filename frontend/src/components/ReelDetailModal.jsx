import React, { useState, useEffect } from 'react';
import { getCollectionTagStyle, formatDate, formatDuration } from '../utils';
import { fetchReelDetails } from '../api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ReelDetailModal({ isOpen, reel, onClose, onDelete }) {
  const [details, setDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'transcript' | 'visual'

  useEffect(() => {
    if (!isOpen || !reel) {
      setDetails(null);
      return;
    }

    const reelId = reel.id || reel._id;
    if (!reelId) return;

    setLoadingDetails(true);
    fetchReelDetails(reelId)
      .then((data) => {
        setDetails(data);
      })
      .catch((err) => {
        console.error('Failed to load reel details:', err);
      })
      .finally(() => {
        setLoadingDetails(false);
      });
  }, [isOpen, reel]);

  if (!isOpen || !reel) return null;

  // Merge preliminary reel props with fully loaded backend details
  const current = details || reel;
  const collectionName = current.collection || reel.collection || 'General';
  const tagStyle = getCollectionTagStyle(collectionName);
  const formattedDate = formatDate(current.created_at || reel.created_at);
  const durationText = formatDuration(current.duration || reel.duration);

  const uploader =
    current.uploader ||
    reel.uploader ||
    (current.title && current.title.startsWith('Video by ')
      ? current.title.replace('Video by ', '').trim()
      : null);

  const title = current.title || reel.title || 'Untitled Reel';
  const summary = current.summary || reel.summary || 'Summary will appear after processing.';
  const transcript = current.transcript || '';
  const language = current.language || 'en';
  const visualFrames = current.visual_frames || [];
  const videoUrl = current.video_url ? `${API_BASE}${current.video_url}` : null;
  const originalUrl = current.reel_url || reel.reel_url || '#';
  const fallbackThumb = current.fallback_thumbnail
    ? `${API_BASE}${current.fallback_thumbnail}`
    : null;
  const displayPoster = current.thumbnail || fallbackThumb;

  const handleCopyTranscript = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white border border-[#EAEAEA] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAEAEA] bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border shrink-0 ${tagStyle}`}>
              {collectionName}
            </span>
            <span className="text-xs text-zinc-400 shrink-0">{formattedDate}</span>
            {uploader ? (
              <span className="text-xs font-mono text-zinc-500 truncate hidden sm:inline">
                @{uploader}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Open on Instagram Button */}
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white ig-gradient hover:opacity-95 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>

            {/* Delete Button */}
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(current);
                }}
                title="Delete reel"
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : null}

            {/* Close (X) Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Video Player / Thumbnail Preview & Metadata */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="relative w-full aspect-[9/12] rounded-2xl overflow-hidden bg-black shadow-inner border border-zinc-900 flex items-center justify-center">
                {videoUrl ? (
                  <video
                    controls
                    playsInline
                    poster={displayPoster}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={displayPoster}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <a
                        href={originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white border border-white/30 hover:scale-105 transition-transform"
                      >
                        <svg className="w-6 h-6 fill-white ml-0.5" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}

                {durationText ? (
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10 pointer-events-none">
                    {durationText}
                  </span>
                ) : null}
              </div>

              {/* Quick Info Box */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-[#EAEAEA] flex flex-col gap-2.5 text-xs text-zinc-600">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Status</span>
                  {current.status === 'processing' ? (
                    <span className="inline-flex items-center gap-1.5 font-medium capitalize text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      Processing in background
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-medium capitalize text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {current.status || 'completed'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Language</span>
                  <span className="font-medium text-zinc-800 uppercase">{language}</span>
                </div>

                {visualFrames.length > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Indexed Frames</span>
                    <span className="font-medium text-zinc-800">{visualFrames.length} scenes</span>
                  </div>
                ) : null}

                <div className="pt-1 border-t border-zinc-200/60 flex items-center justify-between">
                  <span className="text-zinc-400">Original Link</span>
                  <a
                    href={originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-700 hover:text-black font-medium underline truncate max-w-[160px]"
                  >
                    instagram.com/reel
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis, Transcripts & Visual Breakdown */}
            <div className="md:col-span-7 flex flex-col gap-5">
              {/* Main Reel Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
                  {title}
                </h1>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#EAEAEA] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'summary'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Summary
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transcript')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'transcript'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Speech Transcript
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('visual')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'visual'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  Visual Frames ({visualFrames.length})
                </button>
              </div>

              {/* Tab 1: AI Summary */}
              {activeTab === 'summary' ? (
                <div className="flex flex-col gap-3">
                  {current.status === 'processing' ? (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>AI analysis is running in the background. Full summary, transcript, and visual frames will appear shortly.</span>
                    </div>
                  ) : null}

                  <div className="p-5 bg-gradient-to-br from-orange-50/50 via-white to-pink-50/40 rounded-2xl border border-orange-100/70 shadow-xs">
                    <div className="flex items-center gap-2 mb-2 text-orange-600 font-semibold text-xs tracking-wide uppercase">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Summary
                    </div>
                    <p className="text-sm text-zinc-800 leading-relaxed font-normal">
                      {summary}
                    </p>
                  </div>

                  {/* Highlights overview */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-[#EAEAEA] text-xs text-zinc-600 flex flex-col gap-2">
                    <span className="font-semibold text-zinc-800">Quick Takeaways</span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-600 leading-relaxed">
                      <li>
                        Speech detected:{' '}
                        <strong className="text-zinc-800">
                          {transcript ? 'Yes (transcribed & indexed)' : 'No voice audio detected'}
                        </strong>
                      </li>
                      <li>
                        Computer Vision:{' '}
                        <strong className="text-zinc-800">
                          {visualFrames.length > 0
                            ? `${visualFrames.length} frames analyzed with Gemini Vision`
                            : 'Standard indexing'}
                        </strong>
                      </li>
                      <li>
                        Stored in collection: <strong className="text-zinc-800">{collectionName}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : null}

              {/* Tab 2: Speech Transcript */}
              {activeTab === 'transcript' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700">Audio Speech Transcript</span>
                    {transcript ? (
                      <button
                        type="button"
                        onClick={handleCopyTranscript}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect height="13" rx="2" width="13" x="9" y="9" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>{copied ? 'Copied!' : 'Copy text'}</span>
                      </button>
                    ) : null}
                  </div>

                  {transcript ? (
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-[#EAEAEA] max-h-80 overflow-y-auto text-sm text-zinc-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {transcript}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-[#EAEAEA]">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-zinc-200/70 flex items-center justify-center text-zinc-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <line x1="1" x2="23" y1="1" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-zinc-700">No Speech Detected</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        This reel only contained music, background audio, or no spoken words.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Tab 3: Visual Frames & Timeline */}
              {activeTab === 'visual' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Gemini Vision Frame Analysis</span>
                    <span>{visualFrames.length} total frames</span>
                  </div>

                  {visualFrames.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                      {visualFrames.map((frame, idx) => {
                        const frameImg = frame.frame_url ? `${API_BASE}${frame.frame_url}` : null;
                        const frameTime = `${Math.floor(frame.timestamp / 60)}:${(frame.timestamp % 60)
                          .toString()
                          .padStart(2, '0')}`;

                        return (
                          <div
                            key={idx}
                            className="p-3 bg-zinc-50 rounded-2xl border border-[#EAEAEA] flex gap-3.5 items-start hover:border-zinc-300 transition-colors"
                          >
                            {frameImg ? (
                              <div className="relative w-20 aspect-[9/12] rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-200 shadow-2xs">
                                <img
                                  src={frameImg}
                                  alt={`Frame ${idx}`}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white">
                                  {frameTime}
                                </span>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-zinc-200/80 flex items-center justify-center font-mono text-xs text-zinc-500 shrink-0">
                                {frameTime}
                              </div>
                            )}

                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-zinc-800">
                                  Timestamp {frameTime}
                                </span>
                                {frame.scene ? (
                                  <span className="text-[10px] text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-zinc-200">
                                    {frame.scene}
                                  </span>
                                ) : null}
                              </div>

                              <p className="text-xs text-zinc-700 leading-relaxed">
                                {frame.description || 'Frame visual features extracted.'}
                              </p>

                              {frame.visible_text ? (
                                <div className="text-[11px] text-zinc-600 bg-white p-1.5 rounded-lg border border-zinc-200/80 mt-1">
                                  <span className="text-zinc-400 font-medium">Text on screen: </span>
                                  <span className="italic">"{frame.visible_text}"</span>
                                </div>
                              ) : null}

                              {frame.objects ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {frame.objects.split(',').map((obj, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] bg-zinc-200/60 text-zinc-700 px-1.5 py-0.5 rounded-md"
                                    >
                                      {obj.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-[#EAEAEA]">
                      <p className="text-xs text-zinc-500">No extracted visual frames found for this reel.</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
