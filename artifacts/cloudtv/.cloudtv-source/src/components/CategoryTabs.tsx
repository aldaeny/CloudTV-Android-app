import { useAccent } from "../lib/accent";

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: { id: string; name: string; count: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  const accent = useAccent();
  return (
    <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              isActive ? `${accent.bg} border-transparent text-black` : "border-white/10 bg-white/5 text-neutral-300"
            }`}
          >
            {cat.name}
            <span className={`rounded-full px-1.5 text-[10px] ${isActive ? "bg-black/20" : "bg-white/10 text-neutral-400"}`}>{cat.count}</span>
          </button>
        );
      })}
    </div>
  );
}
