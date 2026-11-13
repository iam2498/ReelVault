import React, { useState } from 'react';
import './App.css';

function App() {
  // 1. Download Reel States
  const [reelUrl, setReelUrl] = useState('');
  const [downloadResult, setDownloadResult] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  // 2. Audio Processing States
  const [audioVideoPath, setAudioVideoPath] = useState('');
  const [audioVideoId, setAudioVideoId] = useState('');
  const [audioResult, setAudioResult] = useState(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioError, setAudioError] = useState('');

  // 3. Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [topK, setTopK] = useState(3);
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // 4. Frames Extraction States
  const [framesVideoPath, setFramesVideoPath] = useState('');
  const [framesResult, setFramesResult] = useState(null);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [framesError, setFramesError] = useState('');

  // 5. Vision / OCR States
  const [visionResult, setVisionResult] = useState(null);
  const [isProcessingVision, setIsProcessingVision] = useState(false);
  const [visionError, setVisionError] = useState('');

  // Handlers
  const handleDownload = async (e) => {
    e.preventDefault();
    setIsDownloading(true);
    setDownloadError('');
    setDownloadResult(null);

    try {
      const response = await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: reelUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Download failed');
      }
      setDownloadResult(data);

      // Auto fill video path and ID into the next sections
      if (data.data?.filename) {
        setAudioVideoPath(data.data.filename);
        setFramesVideoPath(data.data.filename);
      }
      if (data.id) {
        setAudioVideoId(data.id);
      }
    } catch (err) {
      setDownloadError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleProcessAudio = async (e) => {
    e.preventDefault();
    setIsProcessingAudio(true);
    setAudioError('');
    setAudioResult(null);

    try {
      const response = await fetch('/Process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_path: audioVideoPath,
          video_id: audioVideoId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Audio processing failed');
      }
      setAudioResult(data);
    } catch (err) {
      setAudioError(err.message);
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');
    setSearchResults(null);

    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          top_k: Number(topK),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Search failed');
      }
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExtractFrames = async (e) => {
    e.preventDefault();
    setIsExtractingFrames(true);
    setFramesError('');
    setFramesResult(null);

    try {
      const response = await fetch('/process-frames', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_path: framesVideoPath }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Extracting frames failed');
      }
      setFramesResult(data);
    } catch (err) {
      setFramesError(err.message);
    } finally {
      setIsExtractingFrames(false);
    }
  };

  const handleVisionFrames = async () => {
    setIsProcessingVision(true);
    setVisionError('');
    setVisionResult(null);

    try {
      const response = await fetch('/Process-frames', {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Vision frames processing failed');
      }
      setVisionResult(data);
    } catch (err) {
      setVisionError(err.message);
    } finally {
      setIsProcessingVision(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎬 ReelVault Testing UI</h1>
        <p>Simple React frontend to test backend APIs</p>
      </header>

      {/* 1. Download Reel */}
      <section className="card">
        <h2>1. Download Reel</h2>
        <form onSubmit={handleDownload}>
          <label>Instagram / Reel URL:</label>
          <input
            type="text"
            placeholder="https://www.instagram.com/reel/..."
            value={reelUrl}
            onChange={(e) => setReelUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={isDownloading}>
            {isDownloading ? 'Downloading Reel...' : 'Download Reel'}
          </button>
        </form>

        {downloadError && <p className="error">{downloadError}</p>}
        {downloadResult && (
          <div className="result-box">
            <h4>Download Success!</h4>
            <p><strong>Title:</strong> {downloadResult.data?.title}</p>
            <p><strong>Database ID:</strong> {downloadResult.id}</p>
            <p><strong>Saved File:</strong> {downloadResult.data?.filename}</p>
            {downloadResult.data?.thumbnail && (
              <img
                src={downloadResult.data.thumbnail}
                alt="Thumbnail"
                className="thumbnail"
              />
            )}
          </div>
        )}
      </section>

      {/* 2. Process Audio & Transcribe */}
      <section className="card">
        <h2>2. Process Audio & Transcribe</h2>
        <form onSubmit={handleProcessAudio}>
          <label>Video File Path:</label>
          <input
            type="text"
            placeholder="D:/28_Days_Plan/ReelVault/backend/downloads/video.mp4"
            value={audioVideoPath}
            onChange={(e) => setAudioVideoPath(e.target.value)}
            required
          />

          <label>Video ID:</label>
          <input
            type="text"
            placeholder="video-id-123"
            value={audioVideoId}
            onChange={(e) => setAudioVideoId(e.target.value)}
            required
          />

          <button type="submit" disabled={isProcessingAudio}>
            {isProcessingAudio ? 'Processing & Transcribing Audio...' : 'Process Audio'}
          </button>
        </form>

        {audioError && <p className="error">{audioError}</p>}
        {audioResult && (
          <div className="result-box">
            <h4>Audio Transcription Success!</h4>
            <p><strong>Detected Language:</strong> {audioResult.language}</p>
            <p><strong>Audio File:</strong> {audioResult.audio_file}</p>
            <p><strong>Chunks Indexed:</strong> {audioResult.chunks_created}</p>
            <p><strong>Transcribed Text:</strong></p>
            <div className="text-box">{audioResult.text}</div>
          </div>
        )}
      </section>

      {/* 3. Semantic Search */}
      <section className="card">
        <h2>3. Semantic Search (ChromaDB)</h2>
        <form onSubmit={handleSearch}>
          <label>Search Query:</label>
          <input
            type="text"
            placeholder="e.g. video about productivity or habits"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />

          <label>Top K Results:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={topK}
            onChange={(e) => setTopK(e.target.value)}
          />

          <button type="submit" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && <p className="error">{searchError}</p>}
        {searchResults && (
          <div className="result-box">
            <h4>Search Results for: "{searchResults.query}"</h4>
            {searchResults.results && searchResults.results.length > 0 ? (
              searchResults.results.map((item, index) => (
                <div key={index} className="search-item">
                  <p><strong>Result #{index + 1}</strong></p>
                  <p><strong>Text:</strong> {item.text}</p>
                  <p><small>Video ID: {item.video_id} | Distance: {item.distance}</small></p>
                </div>
              ))
            ) : (
              <p>No matching chunks found.</p>
            )}
          </div>
        )}
      </section>

      {/* 4. Extract Frames */}
      <section className="card">
        <h2>4. Extract Frames (FFmpeg)</h2>
        <form onSubmit={handleExtractFrames}>
          <label>Video File Path:</label>
          <input
            type="text"
            placeholder="D:/28_Days_Plan/ReelVault/backend/downloads/video.mp4"
            value={framesVideoPath}
            onChange={(e) => setFramesVideoPath(e.target.value)}
            required
          />
          <button type="submit" disabled={isExtractingFrames}>
            {isExtractingFrames ? 'Extracting Frames...' : 'Extract Frames'}
          </button>
        </form>

        {framesError && <p className="error">{framesError}</p>}
        {framesResult && (
          <div className="result-box">
            <h4>{framesResult.message}</h4>
            <p><strong>Frames Folder:</strong> {framesResult.frames_path}</p>
          </div>
        )}
      </section>

      {/* 5. Process Frames (Vision & OCR) */}
      <section className="card">
        <h2>5. Process Frames (SigLIP & EasyOCR)</h2>
        <p>Processes frames in the backend frames folder to generate embeddings and OCR text.</p>
        <button onClick={handleVisionFrames} disabled={isProcessingVision}>
          {isProcessingVision ? 'Running Vision Model & OCR...' : 'Run Vision & OCR'}
        </button>

        {visionError && <p className="error">{visionError}</p>}
        {visionResult && (
          <div className="result-box">
            <h4>Total Frames Processed: {visionResult.total_frames}</h4>
            {visionResult.frames && visionResult.frames.map((frame, index) => (
              <div key={index} className="search-item">
                <p><strong>Frame:</strong> {frame.filename}</p>
                <p><strong>OCR Text:</strong> {frame.ocr_text || '(No text detected)'}</p>
                {frame.embedding && (
                  <p><small>Embedding Dimensions: {frame.embedding.length}</small></p>
                )}
                {frame.error && (
                  <p className="error">Error: {frame.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
