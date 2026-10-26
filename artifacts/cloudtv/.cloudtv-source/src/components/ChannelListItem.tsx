import { Play, Star } from "lucide-react";
import type { Channel } from "../types";
import ChannelLogo from "./ChannelLogo";
import { useChannelEpg } from "../hooks/useChannelEpg";
import { useApp } from "../state/AppContext";
import { formatProgress } from "../lib/format";
import { useAccent } from "../lib/accent";

export default function ChannelListItem({
  channel,
  onPlay,
  active,
}: {
  channel: Channel;
  onPlay: (c: Channel) => void;
  active?: boolean;
}) {
  const { isChannelFavorite, toggleFavorite } = useApp();
  const { current, isSimulated } = useChannelEpg(channel);
  const fav = isChannelFavorite(channel);
  const progress = current ? formatProgress(current.start, current.end) : 0;
  const accent = useAccent();

  return (
    <button
      onClick={() => onPlay(channel)}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
        active ? `${accent.border} ${accent.bgSoft}` : "border-white/5 bg-white/[0.03] active:bg-white/[0.06]"
      }`}
    >
      <ChannelLogo src={channel.logo} alt={channel.name} className="h-11 w-11 shrink-0 rounded-lg p-1" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-white">{channel.name}</p>
          {channel.isRadio && <span className="rounded bg-sky-500/20 px-1 text-[9px] font-bold text-sky-400">FM</span>}
        </div>
        {current ? (
          <div className="mt-1">
            <p className="truncate text-[11px] text-neutral-400">
              {current.title}
              {isSimulated && <span className="ml-1 text-neutral-600">(est.)</span>}
            </p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full rounded-full ${accent.bg}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-0.5 truncate text-[11px] text-neutral-500">{channel.group}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(channel);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
        >
          <Star className={`h-4 w-4 ${fav ? `${accent.fill} ${accent.text}` : "text-neutral-500"}`} />
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-black ${accent.bg}`}>
          <Play className="h-3.5 w-3.5 fill-black" />
        </span>
      </div>
    </button>
  );
}
