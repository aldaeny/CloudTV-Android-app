import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Info, Maximize, Minimize, Star, X } from "lucide-react";
import type { Channel } from "../types";
import VideoPlayer from "./VideoPlayer";
import ChannelLogo from "./ChannelLogo";
import { useChannelEpg } from "../hooks/useChannelEpg";
import { useApp } from "../state/AppContext";
import { formatProgress, formatTime } from "../lib/format";
import { useAccent } from "../lib/accent";

export default function PlayerOverlay({
  channel,
  channels,
  onClose,
  onSelectChannel,
}: {
  channel: Channel;
  channels: Channel[];
  onClose: () => void;
  onSelectChannel: (c: Channel) => void;
}) {
  const { isChannelFavorite, toggleFavorite, addRecent, playback } = useApp();
  const { current, next, isSimulated } = useChannelEpg(channel);
  const accent = useAccent();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const index = useMemo(() => channels.findIndex((c) => c.id === channel.id), [channels, channel.id]);

  useEffect(() => {
    addRecent(channel);
  }, [channel, addRecent]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  function resetHideTimer() {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 4500);
  }

  function goTo(offset: number) {
    if (channels.length === 0) return;
    const nextIndex = (index + offset + channels.length) % channels.length;
    setPlayerError(null);
    onSelectChannel(channels[nextIndex]);
  }

  const fav = isChannelFavorite(channel);
  const progress = current ? formatProgress(current.start, current.end) : 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black">
      <div className="relative aspect-video w-full shrink-0 bg-black" onClick={resetHideTimer}>
        <VideoPlayer
          key={channel.id}
          src={channel.streamUrl}
          className="h-full w-full"
          onError={(msg) => setPlayerError(msg)}
          autoPlay={playback.autoplay}
          bufferSeconds={playback.bufferSeconds}
          quality={playback.preferredQuality}
        />

        <div
          className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/70 via-transparent to-black/80 p-3 transition-opacity duration-300 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white">
              <X className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 px-2 text-center">
              <p className="truncate text-xs font-semibold text-white">{channel.name}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleFavorite(channel)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
              >
                <Star className={`h-4 w-4 ${fav ? `${accent.fill} ${accent.text}` : "text-white"}`} />
              </button>
              <button
                onClick={() => setFullscreen((f) => !f)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
              >
                {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-10">
            <button onClick={() => goTo(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => goTo(1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div>
            {current && (
              <div className="rounded-xl bg-black/40 p-2.5">
                <div className="flex items-center justify-between text-[11px] text-neutral-300">
                  <span className="font-semibold text-white">{current.title}</span>
                  <span>
                    {formatTime(current.start)} - {formatTime(current.end)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/20">
                  <div className={`h-full rounded-full ${accent.bg}`} style={{ width: `${progress}%` }} />
                </div>
                {next && <p className="mt-1 truncate text-[10px] text-neutral-400">Up next: {next.title}</p>}
                {isSimulated && <p className="mt-0.5 text-[9px] text-neutral-500">Estimated schedule - no live EPG provided by source</p>}
              </div>
            )}
          </div>
        </div>

        {playerError && (
          <button
            onClick={() => goTo(1)}
            className={`absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[11px] font-semibold text-black ${accent.bg}`}
          >
            Try next channel
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{channel.name}</p>
          <p className="truncate text-[11px] text-neutral-500">{channel.group}</p>
        </div>
        <button onClick={() => setShowInfo((v) => !v)} className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-neutral-300">
          <Info className="h-3.5 w-3.5" /> Guide
        </button>
      </div>

      {showInfo && (
        <div className="border-b border-white/5 px-4 py-2 text-xs text-neutral-400">
          Tap a channel below to switch instantly. Swipe arrows on the player to jump to the previous/next channel in this category.
        </div>
      )}

      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2.5">
        {channels.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectChannel(c)}
            className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left ${
              c.id === channel.id ? accent.bgSoft : "active:bg-white/5"
            }`}
          >
            <ChannelLogo src={c.logo} alt={c.name} className="h-8 w-8 shrink-0 rounded-md p-0.5" />
            <span className={`truncate text-xs font-medium ${c.id === channel.id ? "text-white" : "text-neutral-300"}`}>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
