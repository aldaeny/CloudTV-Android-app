import { useMemo } from "react";
import type { Channel, EPGProgram } from "../types";
import { useApp } from "../state/AppContext";
import { generateSimulatedEPG, getCurrentAndNext } from "../lib/epgSimulator";

export interface ChannelEpgResult {
  programs: EPGProgram[];
  isSimulated: boolean;
  current?: EPGProgram;
  next?: EPGProgram;
}

export function useChannelEpg(channel: Channel | null | undefined): ChannelEpgResult {
  const { epgByChannel } = useApp();

  return useMemo(() => {
    if (!channel) return { programs: [], isSimulated: false };
    const key = channel.epgChannelId || channel.tvgId;
    const real = key ? epgByChannel[key] : undefined;
    if (real && real.length > 0) {
      const { current, next } = getCurrentAndNext(real);
      return { programs: real, isSimulated: false, current, next };
    }
    const simulated = generateSimulatedEPG(channel);
    const { current, next } = getCurrentAndNext(simulated);
    return { programs: simulated, isSimulated: true, current, next };
  }, [channel, epgByChannel]);
}
