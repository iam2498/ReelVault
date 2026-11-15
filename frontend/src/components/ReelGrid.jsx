import React from 'react';
import ReelCard from './ReelCard';
import EmptyState from './EmptyState';

function SkeletonCard() {
  return (
    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-[9/12] w-full bg-zinc-100"></div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-14 bg-zinc-100 rounded-md"></div>
            <div className="h-3 w-10 bg-zinc-100 rounded"></div>
          </div>
          <div className="h-4 w-3/4 bg-zinc-100 rounded mb-2"></div>
          <div className="h-3 w-full bg-zinc-100 rounded mb-1"></div>
          <div className="h-3 w-2/3 bg-zinc-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function ReelGrid({ reels, isLoading, onReelClick, onDelete }) {
  if (isLoading) {
    return (
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="reelsGrid">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <section>
        <EmptyState />
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="reelsGrid">
        {reels.map((reel) => (
          <ReelCard
            key={reel.id || reel._id || reel.reel_url}
            reel={reel}
            onClick={onReelClick}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
