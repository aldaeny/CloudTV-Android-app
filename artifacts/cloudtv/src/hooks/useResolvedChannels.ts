import { useMemo } from "react";
import { useApp } from "../state/AppContext";
import { favoriteKey } from "../state/favorites";
import type { Channel } from "../types";

/** Resolves a list of favorite/recent keys back into live Channel objects
 * by scanning the currently loaded channel lists of every server. */
export function useResolvedChannels(keys: string[]): Channel[] {
  const { channelsByServer } = useApp();

  return useMemo(() => {
    const all: Channel[] = Object.values(channelsByServer).flat();
    const byKey = new Map<string, Channel>();
    for (const c of all) {
      byKey.set(favoriteKey(c), c);
    }
    return keys.map((k) => byKey.get(k)).filter((c): c is Channel => Boolean(c));
  }, [keys, channelsByServer]);
}
