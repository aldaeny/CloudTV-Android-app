import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Tv2 } from "lucide-react";
import { useApp } from "../state/AppContext";
import CategoryTabs from "../components/CategoryTabs";
import ChannelListItem from "../components/ChannelListItem";
import { buildCategories, filterChannels } from "../lib/categories";
import type { Channel } from "../types";
import EmptyState from "../components/EmptyState";

const PAGE_SIZE = 40;

export default function LiveTVScreen({ onPlay, currentChannelId }: { onPlay: (c: Channel, list: Channel[]) => void; currentChannelId?: string }) {
  const { activeChannels, loadingServerId, activeServer } = useApp();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(() => buildCategories(activeChannels), [activeChannels]);
  const filtered = useMemo(() => filterChannels(activeChannels, category, query), [activeChannels, category, query]);
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [category, query, activeServer?.id]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const isLoading = loadingServerId === activeServer?.id;

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
          />
        </div>
      </div>
      <CategoryTabs categories={categories} active={category} onChange={setCategory} />

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {isLoading && activeChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            <p className="text-sm">Loading channels…</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Tv2 className="h-8 w-8" />}
            title="No channels found"
            subtitle={activeChannels.length === 0 ? "This server has no channels yet. Try refreshing from Settings." : "Try a different search or category."}
          />
        ) : (
          <div className="space-y-2">
            {visible.map((c) => (
              <ChannelListItem key={c.id} channel={c} onPlay={(ch) => onPlay(ch, filtered)} active={c.id === currentChannelId} />
            ))}
            <div ref={sentinelRef} className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
