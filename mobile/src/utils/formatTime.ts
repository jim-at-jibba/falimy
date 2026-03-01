/** Format a relative time string like "2 min ago" or "3 hrs ago". */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return "Unknown";
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/** Format an absolute time string like "2:35 PM". */
export function formatAbsoluteTime(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Marker colour based on recency. */
export function getMarkerColor(date: Date | null): string {
  if (!date) return "#999";
  const diff = Date.now() - date.getTime();
  if (diff < 10 * 60_000) return "#2BCCBD"; // <10min: teal (active)
  if (diff < 60 * 60_000) return "#F5A623"; // <1hr: amber
  return "#999"; // stale
}

/** Get initials from a name (e.g. "James Best" → "JB"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
