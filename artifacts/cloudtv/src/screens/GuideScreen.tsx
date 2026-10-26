import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { useApp } from "../state/AppContext";
import { useChannelEpg } from "../hooks/useChannelEpg";
import ChannelLogo from "../components/ChannelLogo";
import CategoryTabs from "../components/CategoryTabs";
import { buildCategories, filterChannels } from "../lib/categories";
import { formatTime } from "../lib/format";
import { useAccent } from "../lib/accent";
import type { Channel } from "../types";
import EmptyState from "../components/EmptyState";

const PX_PER_MIN = 2.6;
const WINDOW_MINUTES = 240; // 4 hour visible window

function GuideRow({ channel, windowStart, onPlay }: { channel: Channel; windowStart: number; onPlay: (c: Channel) => void }) {
  const { programs } = useChannelEpg(channel);
  const accent = useAccent();
  const windowEnd = windowStart + WINDOW_MINUTES * 60000;
  const visiblePrograms = programs.filter((p) => p.end > windowStart && p.start < windowEnd);
  const now = Date.now();

  return (
    <div className="flex border-b border-white/5">
      <button
        onClick={() => onPlay(channel)}
        className="sticky left-0 z-10 flex w-32 shrink-0 items-center gap-2 bg-[#0b0d12] px-2 py-2.5"
      >
        <ChannelLogo src={channel.logo} alt={channel.name} className="h-7 w-7 shrink-0 rounded p-0.5" />
        <span className="truncate text-left text-[11px] font-medium text-neutral-200">{channel.name}</span>
      </button>
      <div className="relative flex-1" style={{ width: WINDOW_MINUTES * PX_PER_MIN, minHeight: 48 }}>
        {visiblePrograms.length === 0 && <div className="flex h-full items-center px-3 text-[10px] text-neutral-600">No guide data</div>}
        {visiblePrograms.map((p) => {
          const startOffset = Math.max(0, (p.start - windowStart) / 60000) * PX_PER_MIN;
          const endOffset = Math.min(WINDOW_MINUTES, (p.end - windowStart) / 60000) * PX_PER_MIN;
          const width = Math.max(endOffset - startOffset, 40);
          const isLive = now >= p.start && now < p.end;
          return (
            <div
              key={p.id}
              className={`absolute top-1 bottom-1 overflow-hidden rounded-lg border px-2 py-1 ${
                isLive ? `${accent.bgSoft} ${accent.border}` : "border-white/5 bg-white/[0.04]"
              }`}
              style={{ left: startOffset, width }}
              title={p.title}
            >
              <p className={`truncate text-[10px] font-medium ${isLive ? "text-white" : "text-neutral-400"}`}>{p.title}</p>
              <p className="truncate text-[9px] text-neutral-500">{formatTime(p.start)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function GuideScreen({ onPlay }: { onPlay: (c: Channel, list: Channel[]) => void }) {
  const { activeChannels } = useApp();
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => buildCategories(activeChannels), [activeChannels]);
  const filtered = useMemo(() => filterChannels(activeChannels, category, ""), [activeChannels, category]).slice(0, 80);
  const windowStart = useMemo(() => Date.now() - 20 * 60000, []);

  const hourMarkers = useMemo(() => {
    const markers = [];
    const count = Math.ceil(WINDOW_MINUTES / 60) + 1;
    for (let i = 0; i < count; i++) {
      markers.push(windowStart + i * 60 * 60000);
    }
    return markers;
  }, [windowStart]);

  if (activeChannels.length === 0) {
    return (
      <div className="px-4">
        <EmptyState icon={<CalendarClock className="h-8 w-8" />} title="No EPG data yet" subtitle="Connect a server to load channels and program guide." />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <CategoryTabs categories={categories} active={category} onChange={setCategory} />
      <div className="flex-1 overflow-auto">
        <div className="flex border-b border-white/10 bg-[#0b0d12]">
          <div className="sticky left-0 z-10 w-32 shrink-0 bg-[#0b0d12] px-2 py-1.5 text-[10px] font-semibold text-neutral-500">
            Now · {formatTime(Date.now())}
          </div>
          <div className="relative flex-1" style={{ width: WINDOW_MINUTES * PX_PER_MIN }}>
            {hourMarkers.map((t, i) => (
              <div
                key={i}
                className="absolute top-0 border-l border-white/10 py-1.5 pl-1 text-[9px] text-neutral-500"
                style={{ left: Math.max(0, (t - windowStart) / 60000) * PX_PER_MIN }}
              >
                {formatTime(t)}
              </div>
            ))}
          </div>
        </div>
        {filtered.map((c) => (
          <GuideRow key={c.id} channel={c} windowStart={windowStart} onPlay={(ch) => onPlay(ch, filtered)} />
        ))}
      </div>
    </div>
  );
}
