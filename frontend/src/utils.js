export const GRADIENT_PAIRS = [
  "from-indigo-900/90 to-slate-900",
  "from-emerald-950 to-teal-900",
  "from-amber-950 to-orange-900",
  "from-zinc-900 to-stone-900",
  "from-violet-950 to-blue-900",
  "from-amber-950 to-neutral-900",
  "from-red-950 to-stone-900",
  "from-cyan-950 to-slate-900",
];

export function getGradientForId(id) {
  if (!id) return GRADIENT_PAIRS[0];
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
}

const CYCLE_TAG_STYLES = [
  "text-orange-600 bg-orange-50 border-orange-100",
  "text-emerald-600 bg-emerald-50 border-emerald-100",
  "text-rose-600 bg-rose-50 border-rose-100",
  "text-purple-600 bg-purple-50 border-purple-100",
];

const KNOWN_COLLECTION_STYLES = {
  startup: "text-orange-600 bg-orange-50 border-orange-100",
  coding: "text-emerald-600 bg-emerald-50 border-emerald-100",
  recipes: "text-rose-600 bg-rose-50 border-rose-100",
  fitness: "text-purple-600 bg-purple-50 border-purple-100",
};

export function getCollectionTagStyle(collectionName) {
  if (!collectionName || collectionName.toLowerCase() === "general") {
    return "text-zinc-600 bg-zinc-100 border-zinc-200";
  }
  const key = collectionName.toLowerCase();
  if (KNOWN_COLLECTION_STYLES[key]) {
    return KNOWN_COLLECTION_STYLES[key];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return CYCLE_TAG_STYLES[Math.abs(hash) % CYCLE_TAG_STYLES.length];
}

export function formatDate(dateString) {
  if (!dateString) {
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return dateString;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

export function formatDuration(seconds) {
  if (seconds === undefined || seconds === null || seconds === "") return null;
  const num = Number(seconds);
  if (isNaN(num)) return null;
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const DEFAULT_COLLECTIONS = ["Coding", "Fitness", "Recipes", "Startup"];

export function loadStoredCollections() {
  try {
    const data = localStorage.getItem("reelvault_custom_collections");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Failed to read custom collections from localStorage", err);
    return [];
  }
}

export function saveStoredCollections(collections) {
  try {
    localStorage.setItem("reelvault_custom_collections", JSON.stringify(collections));
  } catch (err) {
    console.error("Failed to save custom collections to localStorage", err);
  }
}

export function loadStoredReelCollections() {
  try {
    const data = localStorage.getItem("reelvault_reel_collections");
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Failed to read reel collections map from localStorage", err);
    return {};
  }
}

export function saveStoredReelCollections(map) {
  try {
    localStorage.setItem("reelvault_reel_collections", JSON.stringify(map));
  } catch (err) {
    console.error("Failed to save reel collections map to localStorage", err);
  }
}
