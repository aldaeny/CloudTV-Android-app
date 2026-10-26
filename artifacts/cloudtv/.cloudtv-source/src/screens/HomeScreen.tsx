import { useMemo } from "react";
import { Clapperboard, Drama, Globe2, Music2, Newspaper, PlusCircle, Smile, Sparkles, Trophy, Tv } from "lucide-react";
import { useApp } from "../state/AppContext";
import { buildCategories } from "../lib/categories";
import ChannelLogo from "../components/ChannelLogo";
import { useResolvedChannels } from "../hooks/useResolvedChannels";
import { useAccent } from "../lib/accent";
import type { Channel } from "../types";

const ICONS: { match: string; icon: typeof Tv }[] = [
  { match: "news", icon: Newspaper },
  { match: "sport", icon: Trophy },
  { match: "movie", icon: Clapperboard },
  { match: "music", icon: Music2 },
  { match: "kids", icon: Smile },
  { match: "entertainment", icon: Sparkles },
  { match: "drama", icon: Drama },
  { match: "general", icon: Globe2 },
];

function iconFor(name: string) {
  const found = ICONS.find((i) => name.toLowerCase().includes(i.match));
  return found?.icon || Tv;
}

export default function HomeScreen({
  onBrowseCategory,
  onPlay,
  onAddServer,
}: {
  onBrowseCategory: (id: string) => void;
  onPlay: (c: Channel, list: Channel[]) => void;
  onAddServer: () => void;
}) {
  const { activeServer, activeChannels, recent, favorites, servers } = useApp();
  const accent = useAccent();
  const categories = useMemo(() => buildCategories(activeChannels).filter((c) => c.id !== "all").slice(0, 8), [activeChannels]);
  const recentChannels = useResolvedChannels(recent).slice(0, 12);
  const favoriteChannels = useResolvedChannels(favorites).slice(0, 12);

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-8">
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${accent.gradient} p-5 text-black`}>
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/70">{activeServer?.name || "No server"}</p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">Watch Live TV, anywhere.</h2>
          <p className="mt-1 text-sm text-black/80">{activeChannels.length} channels ready to stream right now.</p>
          <button
            onClick={() => onBrowseCategory("all")}
            className="mt-3 rounded-full bg-black px-4 py-2 text-xs font-bold text-white active:scale-95"
          >
            Browse Live TV
          </button>
        </div>
        <Tv className="absolute -right-4 -top-4 h-28 w-28 text-black/10" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Categories</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const Icon = iconFor(cat.name);
            return (
              <button key={cat.id} onClick={() => onBrowseCategory(cat.id)} className="flex flex-col items-center gap-1.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-neutral-200">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="w-full truncate text-center text-[10px] text-neutral-400">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {recentChannels.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-white">Continue Watching</h3>
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            {recentChannels.map((c) => (
              <button key={c.id} onClick={() => onPlay(c, recentChannels)} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
                <ChannelLogo src={c.logo} alt={c.name} className="h-16 w-16 rounded-2xl bg-white/5 p-2" />
                <span className="w-full truncate text-center text-[10px] text-neutral-400">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {favoriteChannels.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-white">Your Favorites</h3>
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            {favoriteChannels.map((c) => (
              <button key={c.id} onClick={() => onPlay(c, favoriteChannels)} className="flex w-20 shrink-0 flex-col items-center gap-1.5">
                <ChannelLogo src={c.logo} alt={c.name} className="h-16 w-16 rounded-2xl bg-white/5 p-2" />
                <span className="w-full truncate text-center text-[10px] text-neutral-400">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAddServer}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-left"
      >
        <PlusCircle className="h-8 w-8 text-neutral-500" />
        <div>
          <p className="text-sm font-semibold text-white">Add another IPTV server</p>
          <p className="text-xs text-neutral-500">Connect via Xtream Codes API or an M3U playlist URL ({servers.length} connected now)</p>
        </div>
      </button>
    </div>
  );
}
