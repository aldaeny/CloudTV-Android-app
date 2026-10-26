import type { Channel, EPGProgram } from "../types";

// Deterministic pseudo-random generator so the same channel always
// produces the same schedule within a session (seeded by channel id).
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function next() {
    h = (Math.imul(h, 1664525) + 1013904223) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const TITLES_BY_GROUP: Record<string, string[]> = {
  news: ["Morning Bulletin", "World Report", "Business Today", "Evening News", "Weather Watch", "Prime Headlines"],
  sports: ["Match Replay", "Sports Center", "Live: Matchday", "Championship Highlights", "Game Analysis", "Press Conference"],
  movies: ["Feature Film", "Cinema Classics", "Movie Premiere", "Box Office Picks", "Director's Cut", "Late Night Film"],
  entertainment: ["Talk Show", "Celebrity Hour", "Game Night", "Variety Show", "Studio Live", "Comedy Special"],
  kids: ["Cartoon Time", "Kids Adventure", "Storybook Hour", "Animation Block", "Fun Zone", "Junior Heroes"],
  music: ["Top Hits", "Music Mix", "Live Session", "Chart Countdown", "Acoustic Hour", "Artist Spotlight"],
  documentary: ["Nature Explorers", "Deep History", "Science Now", "World Cultures", "Wildlife Diaries", "Mystery Files"],
  general: ["Daily Show", "Spotlight", "Feature Program", "Special Report", "Prime Time", "Late Edition"],
};

function pickTitles(group: string): string[] {
  const key = Object.keys(TITLES_BY_GROUP).find((k) => group.toLowerCase().includes(k));
  return TITLES_BY_GROUP[key || "general"];
}

/**
 * Generates a believable 24h schedule for a channel when no real EPG
 * data is available. Clearly used only as a visual placeholder.
 */
export function generateSimulatedEPG(channel: Channel, dayStart?: number): EPGProgram[] {
  const rand = seededRandom(channel.id);
  const titles = pickTitles(channel.group || "general");
  const start = dayStart ?? new Date().setHours(0, 0, 0, 0);
  const programs: EPGProgram[] = [];
  let cursor = start;
  const dayEnd = start + 24 * 60 * 60 * 1000;
  let i = 0;
  while (cursor < dayEnd) {
    const durationMinutes = [30, 30, 45, 60, 60, 90][Math.floor(rand() * 6)];
    const end = Math.min(cursor + durationMinutes * 60 * 1000, dayEnd);
    programs.push({
      id: `${channel.id}-sim-${i}`,
      channelId: channel.epgChannelId || channel.id,
      title: titles[Math.floor(rand() * titles.length)],
      description: `Scheduled programming on ${channel.name}.`,
      start: cursor,
      end,
    });
    cursor = end;
    i += 1;
  }
  return programs;
}

export function getCurrentAndNext(programs: EPGProgram[], now = Date.now()): { current?: EPGProgram; next?: EPGProgram } {
  const idx = programs.findIndex((p) => now >= p.start && now < p.end);
  if (idx === -1) {
    const next = programs.find((p) => p.start > now);
    return { next };
  }
  return { current: programs[idx], next: programs[idx + 1] };
}
