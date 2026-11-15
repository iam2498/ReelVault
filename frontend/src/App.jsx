import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from './components/Header';
import AddReelForm from './components/AddReelForm';
import CollectionsBar from './components/CollectionsBar';
import ReelGrid from './components/ReelGrid';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ReelDetailModal from './components/ReelDetailModal';
import Footer from './components/Footer';
import { fetchLibrary, processReel, searchReels, deleteReel } from './api';
import {
  DEFAULT_COLLECTIONS,
  loadStoredCollections,
  saveStoredCollections,
  loadStoredReelCollections,
  saveStoredReelCollections,
} from './utils';

export default function App() {
  const [libraryReels, setLibraryReels] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastTimer, setToastTimer] = useState(null);

  // Selected reel for expanded detail view
  const [selectedReel, setSelectedReel] = useState(null);

  // Delete modal state
  const [reelToDelete, setReelToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Collections state
  const [customCollections, setCustomCollections] = useState(() => loadStoredCollections());
  const [activeCollection, setActiveCollection] = useState('all');
  const [reelCollectionsMap, setReelCollectionsMap] = useState(() => loadStoredReelCollections());

  const searchAbortRef = useRef(null);

  // All collections combined
  const allCollections = useMemo(() => {
    return [...DEFAULT_COLLECTIONS, ...customCollections];
  }, [customCollections]);

  // Load Library on initial mount
  const loadLibrary = useCallback(async () => {
    try {
      const data = await fetchLibrary();
      const reels = data.reels || [];
      setLibraryReels(reels);

      // Prune any deleted/orphaned IDs from localStorage collection map
      const validIds = new Set(reels.map((r) => r.id || r._id));
      setReelCollectionsMap((prev) => {
        let changed = false;
        const cleaned = {};
        for (const [id, col] of Object.entries(prev)) {
          if (validIds.has(id)) {
            cleaned[id] = col;
          } else {
            changed = true;
          }
        }
        if (changed) {
          saveStoredReelCollections(cleaned);
          return cleaned;
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Polling for processing reels: if any reel is 'processing', poll every 3 seconds
  useEffect(() => {
    const hasProcessing = libraryReels.some((r) => r.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchLibrary();
        const updated = data.reels || [];
        setLibraryReels(updated);

        // If the selected modal reel was processing, update it too
        if (selectedReel && selectedReel.status === 'processing') {
          const fresh = updated.find(
            (r) => (r.id || r._id) === (selectedReel.id || selectedReel._id)
          );
          if (fresh) setSelectedReel(fresh);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [libraryReels, selectedReel]);

  // Toast helper
  const showToast = (type, message) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    setToast({ type, message });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    setToastTimer(timer);
  };

  // Debounced search logic
  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      setSearchResults(null);
      return;
    }

    const handler = setTimeout(async () => {
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      try {
        const data = await searchReels(query, 12, controller.signal);
        setSearchResults(data.results || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search request error:', err);
          setSearchResults([]);
          showToast('error', 'Search failed. Please try again.');
        }
      }
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Handle Save Reel
  const handleSaveReel = async (url, onSuccess) => {
    setIsSaving(true);
    try {
      const data = await processReel(url);
      const newId = data.video_id || data.id;

      // Assign active collection if not 'all'
      if (activeCollection && activeCollection.toLowerCase() !== 'all' && newId) {
        setReelCollectionsMap((prev) => {
          const updated = { ...prev, [newId]: activeCollection };
          saveStoredReelCollections(updated);
          return updated;
        });
      }

      onSuccess();
      showToast(
        'success',
        data.status === 'completed'
          ? 'Reel saved and summarized successfully!'
          : 'Reel added! Analyzing scenes & transcribing in background...'
      );
      await loadLibrary();
    } catch (err) {
      console.error('Save error:', err);
      showToast(
        'error',
        err.message || 'Could not save this reel. Please check the link and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Reel Selection for detail view
  const handleSelectReel = (reel) => {
    setSelectedReel(reel);
  };

  // Handle Delete Reel
  const handleRequestDelete = (reel) => {
    setReelToDelete(reel);
  };

  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;
    const targetId = reelToDelete.id || reelToDelete._id;
    if (!targetId) return;

    setIsDeleting(true);
    try {
      await deleteReel(targetId);

      // Remove from library and search lists
      setLibraryReels((prev) =>
        prev.filter((r) => (r.id || r._id) !== targetId)
      );
      setSearchResults((prev) =>
        prev ? prev.filter((r) => (r.id || r._id) !== targetId) : null
      );

      // Clean up localStorage collection map
      setReelCollectionsMap((prev) => {
        if (!prev[targetId]) return prev;
        const updated = { ...prev };
        delete updated[targetId];
        saveStoredReelCollections(updated);
        return updated;
      });

      // If the deleted reel was open in the details view, close it
      if (
        selectedReel &&
        (selectedReel.id === targetId || selectedReel._id === targetId)
      ) {
        setSelectedReel(null);
      }

      showToast('success', 'Reel and all associated files deleted successfully!');
      setReelToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(
        'error',
        err.message || 'Failed to delete reel. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Create Collection
  const handleCreateCollection = (name) => {
    if (!name) return;
    const exists = allCollections.some(
      (c) => c.toLowerCase() === name.toLowerCase()
    );
    if (!exists) {
      const updated = [...customCollections, name];
      setCustomCollections(updated);
      saveStoredCollections(updated);
    }
    setActiveCollection(name);
  };

  // Compute displayed reels
  const activeList = searchResults !== null ? searchResults : libraryReels;

  // Enrich with stored collection assignments
  const enrichedList = useMemo(() => {
    return activeList.map((reel) => {
      const id = reel.id || reel._id;
      const assigned = reelCollectionsMap[id] || reel.collection || 'General';
      return {
        ...reel,
        collection: assigned,
      };
    });
  }, [activeList, reelCollectionsMap]);

  // Filter by active collection
  const filteredReels = useMemo(() => {
    if (activeCollection.toLowerCase() === 'all') {
      return enrichedList;
    }
    return enrichedList.filter(
      (reel) => (reel.collection || '').toLowerCase() === activeCollection.toLowerCase()
    );
  }, [enrichedList, activeCollection]);

  return (
    <div className="min-h-screen flex flex-col antialiased text-zinc-900 bg-[#FAFAFA]">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={() => setSearchQuery('')}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-10 flex flex-col gap-10">
        <AddReelForm
          onSave={handleSaveReel}
          isSaving={isSaving}
          toast={toast}
        />

        <CollectionsBar
          collections={allCollections}
          activeCollection={activeCollection}
          onSelectCollection={setActiveCollection}
          totalCount={libraryReels.length}
          filteredCount={filteredReels.length}
          isSearching={Boolean(searchQuery.trim())}
          onCreateCollection={handleCreateCollection}
        />

        <ReelGrid
          reels={filteredReels}
          isLoading={isLoading}
          onReelClick={handleSelectReel}
          onDelete={handleRequestDelete}
        />
      </main>

      {/* Expanded Detail Modal */}
      <ReelDetailModal
        isOpen={Boolean(selectedReel)}
        reel={selectedReel}
        onClose={() => setSelectedReel(null)}
        onDelete={handleRequestDelete}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(reelToDelete)}
        reel={reelToDelete}
        onClose={() => setReelToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
