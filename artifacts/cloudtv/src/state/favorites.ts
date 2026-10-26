import type { Channel } from "../types";

/** A stable key for a channel that survives playlist refreshes. */
export function favoriteKey(channel: Channel): string {
  return `${channel.serverId}::${channel.tvgId || channel.name}`.toLowerCase();
}
