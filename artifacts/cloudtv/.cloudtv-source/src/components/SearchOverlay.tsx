import { useMemo, useState } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { useApp } from "../state/AppContext";
import ChannelListItem from "./ChannelListItem";
import EmptyState from "./EmptyState";
import type { Channel } from "../types";

export default function SearchOverlay({ onClose, onPlay }: { onClose: () => void; onPlay: (c: Channel, list: Channel[]) => void }) {
  const { activeChannels } = useApp();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return activeChannels.filter((c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)).slice(0, 80);
  }, [query, activeChannels]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#0b0d12]">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <SearchIcon className="h-4 w-4 text-neutral-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all channels..."
            className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
        {!query.trim() ? (
          <EmptyState icon={<SearchIcon className="h-8 w-8" />} title="Search your channels" subtitle="Find channels by name or category." />
        ) : results.length === 0 ? (
          <EmptyState icon={<SearchIcon className="h-8 w-8" />} title="No results" subtitle={`Nothing matched "${query}"`} />
        ) : (
          <div className="space-y-2">
            {results.map((c) => (
              <ChannelListItem key={c.id} channel={c} onPlay={(ch) => onPlay(ch, results)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
