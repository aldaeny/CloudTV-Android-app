export function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatProgress(start: number, end: number, now = Date.now()): number {
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function timeUntil(ms: number): string {
  const diff = ms - Date.now();
  if (diff <= 0) return "now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `in ${hours}h ${rem}m`;
}
