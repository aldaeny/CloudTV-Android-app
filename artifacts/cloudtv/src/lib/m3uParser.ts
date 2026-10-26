import type { Channel } from "../types";

/** Read quoted or unquoted Extended-M3U attributes without breaking on spaces. */
function extractAttr(line: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = line.match(new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s,]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function resolveStreamUrl(url: string, playlistUrl?: string): string {
  if (!playlistUrl) return url;
  try {
    // Relative stream paths are common in M3U files hosted by providers.
    return new URL(url, playlistUrl).toString();
  } catch {
    return url;
  }
}

/**
 * Parses an Extended M3U/M3U8 playlist into normalized channels.
 * Handles quoted attributes, EXTGRP, VLC options, radio streams and relative URLs.
 */
export function parseM3U(content: string, serverId: string, playlistUrl?: string): Channel[] {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const channels: Channel[] = [];
  let pending: Partial<Channel> | null = null;
  let counter = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^#EXTINF/i.test(line)) {
      const commaIdx = line.indexOf(",");
      const metaPart = commaIdx >= 0 ? line.slice(0, commaIdx) : line;
      const namePart = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "";
      const tvgId = extractAttr(metaPart, "tvg-id") || extractAttr(metaPart, "tvg-name");
      pending = {
        name: namePart || extractAttr(metaPart, "tvg-name") || "Unknown Channel",
        logo: extractAttr(metaPart, "tvg-logo"),
        tvgId,
        epgChannelId: tvgId,
        group: extractAttr(metaPart, "group-title") || "Uncategorized",
      };
      continue;
    }

    if (/^#EXTGRP:/i.test(line)) {
      if (pending) pending.group = line.slice(line.indexOf(":") + 1).trim() || "Uncategorized";
      continue;
    }
    if (line.startsWith("#")) continue;

    // A URL row may appear without EXTINF; preserve it as a playable channel.
    counter += 1;
    const streamUrl = resolveStreamUrl(line, playlistUrl);
    const group = pending?.group || "Uncategorized";
    const isRadio = /\.(mp3|aac|ogg|opus)(?:[?#]|$)/i.test(streamUrl) || /radio/i.test(group);
    const name = pending?.name || `Channel ${counter}`;
    channels.push({
      id: `${serverId}-${counter}-${pending?.tvgId || name}`,
      name,
      logo: pending?.logo,
      group,
      streamUrl,
      tvgId: pending?.tvgId,
      epgChannelId: pending?.epgChannelId,
      serverId,
      isRadio,
    });
    pending = null;
  }

  return channels;
}
