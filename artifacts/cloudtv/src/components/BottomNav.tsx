import { Clapperboard, Home, ListVideo, Settings, Star } from "lucide-react";
import type { Tab } from "../navigation";
import { useAccent } from "../lib/accent";

const ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "live", label: "Live TV", icon: Clapperboard },
  { id: "guide", label: "Guide", icon: ListVideo },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const accent = useAccent();
  return (
    <nav className="grid grid-cols-5 border-t border-white/5 bg-[#0d0f14]/95 px-1 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5 backdrop-blur">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className="flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors"
          >
            <Icon
              className={`h-5 w-5 transition-colors ${isActive ? accent.text : "text-neutral-500"}`}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <span className={`text-[10px] font-medium transition-colors ${isActive ? accent.text : "text-neutral-500"}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
