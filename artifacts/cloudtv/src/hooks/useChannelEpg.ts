import { useMemo } from "react";
import type { Channel, EPGProgram } from "../types";
import { useApp } from "../state/AppContext";
import { getCurrentAndNext } from "../lib/epgSimulator";

export interface ChannelEpgResult {
  programs: EPGProgram[];
  current?: EPGProgram;
  next?: EPGProgram;
}

export function useChannelEpg(channel: Channel | null | undefined): ChannelEpgResult {
  const { epgByChannel } = useApp();

  return useMemo(() => {
    if (!channel) return { programs: [] };
    const key = channel.epgChannelId || channel.tvgId;
    const real = key ? epgByChannel[key] : undefined;
    if (real && real.length > 0) {
      const { current, next } = getCurrentAndNext(real);
      return { programs: real, current, next };
    }
    return { programs: [] };
  }, [channel, epgByChannel]);
}
