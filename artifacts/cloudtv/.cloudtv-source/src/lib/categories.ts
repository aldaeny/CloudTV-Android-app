import type { Category, Channel } from "../types";

export function buildCategories(channels: Channel[]): Category[] {
  const map = new Map<string, number>();
  for (const c of channels) {
    const group = c.group || "Uncategorized";
    map.set(group, (map.get(group) || 0) + 1);
  }
  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ id: name, name, count }));
  return [{ id: "all", name: "All", count: channels.length }, ...sorted];
}

export function filterChannels(channels: Channel[], category: string, query: string): Channel[] {
  let list = channels;
  if (category !== "all") {
    list = list.filter((c) => c.group === category);
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((c) => c.name.toLowerCase().includes(q));
  }
  return list;
}
