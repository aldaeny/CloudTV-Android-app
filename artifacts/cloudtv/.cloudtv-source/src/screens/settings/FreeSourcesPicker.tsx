import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { FREE_SERVER_ID, FREE_SOURCE_OPTIONS } from "../../data/freeSources";
import { useApp } from "../../state/AppContext";
import { useAccent } from "../../lib/accent";

export default function FreeSourcesPicker({ onBack }: { onBack: () => void }) {
  const { freeSourceIds, setFreeSources, refreshServerChannels, loadEpgForServer } = useApp();
  const [selected, setSelected] = useState<string[]>(freeSourceIds);
  const [saving, setSaving] = useState(false);
  const accent = useAccent();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSave() {
    setSaving(true);
    setFreeSources(selected.length ? selected : ["us"]);
    await refreshServerChannels(FREE_SERVER_ID);
    await loadEpgForServer(FREE_SERVER_ID);
    setSaving(false);
    onBack();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-bold text-white">Free Channel Packs</h2>
      </div>
      <p className="px-4 pb-3 text-xs text-neutral-500">
        Pick one or more free, publicly available channel packs (sourced from the community-maintained iptv-org directory). No account needed.
      </p>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {FREE_SOURCE_OPTIONS.map((opt) => {
            const checked = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left ${
                  checked ? `${accent.border} ${accent.bgSoft}` : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span className="flex items-center gap-2.5 text-sm text-white">
                  <span className="text-lg leading-none">{opt.flag}</span>
                  {opt.label}
                  <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] uppercase text-neutral-400">{opt.kind}</span>
                </span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${checked ? `${accent.bg} border-transparent` : "border-white/20"}`}>
                  {checked && <Check className="h-3.5 w-3.5 text-black" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 pb-6 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black disabled:opacity-60 ${accent.bg}`}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Updating channel list…" : `Save (${selected.length} selected)`}
        </button>
      </div>
    </div>
  );
}
