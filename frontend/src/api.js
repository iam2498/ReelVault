const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchLibrary(signal) {
  const res = await fetch(`${API_BASE}/reels/library`, { signal });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to fetch library (${res.status})`);
  }
  return res.json();
}

export async function processReel(url) {
  const res = await fetch(`${API_BASE}/reels/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Could not save this reel. Please check the link and try again.");
  }
  return res.json();
}

export async function searchReels(query, top_k = 12, signal) {
  const res = await fetch(`${API_BASE}/reels/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, top_k }),
    signal,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Search failed (${res.status})`);
  }
  return res.json();
}

export async function deleteReel(id) {
  const res = await fetch(`${API_BASE}/reels/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to delete reel (${res.status})`);
  }
  return res.json();
}

export async function fetchReelDetails(id) {
  const res = await fetch(`${API_BASE}/reels/${id}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to fetch reel details (${res.status})`);
  }
  return res.json();
}
