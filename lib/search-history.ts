/**
 * Search history management using localStorage
 */

export interface SearchHistoryItem {
  digest: string;
  network: "mainnet" | "testnet";
  timestamp: number;
  type?: string; // e.g., "transfer", "swap", "stake"
  summary?: string; // Brief summary like "Sent 1.5 BNB"
}

const STORAGE_KEY = "mull_search_history";
const MAX_HISTORY_ITEMS = 10;

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SearchHistoryItem[];
  } catch {
    return [];
  }
}

/**
 * Save a search to history
 */
export function saveToHistory(item: Omit<SearchHistoryItem, "timestamp">): void {
  if (typeof window === "undefined") return;

  try {
    const history = getSearchHistory();

    // Remove duplicate if exists (same digest + network)
    const filtered = history.filter(
      (h) => !(h.digest === item.digest && h.network === item.network)
    );

    // Add new item at the beginning
    const newHistory: SearchHistoryItem[] = [{ ...item, timestamp: Date.now() }, ...filtered].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Update an existing history item with additional details
 */
export function updateHistoryItem(
  digest: string,
  network: string,
  updates: { type?: string; summary?: string }
): void {
  if (typeof window === "undefined") return;

  try {
    const history = getSearchHistory();
    const index = history.findIndex((h) => h.digest === digest && h.network === network);

    if (index !== -1) {
      history[index] = { ...history[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove a specific item from history
 */
export function removeFromHistory(digest: string, network: string): void {
  if (typeof window === "undefined") return;

  try {
    const history = getSearchHistory();
    const filtered = history.filter((h) => !(h.digest === digest && h.network === network));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Format relative time (e.g., "2 minutes ago", "1 hour ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
