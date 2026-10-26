import { ArrowLeft } from "lucide-react";
import { useApp } from "../../state/AppContext";
import { useAccent } from "../../lib/accent";

const QUALITIES: { id: "auto" | "high" | "medium" | "low"; label: string; desc: string }[] = [
  { id: "auto", label: "Auto", desc: "Adapts to your connection speed" },
  { id: "high", label: "High", desc: "Best available quality" },
  { id: "medium", label: "Medium", desc: "Balanced quality & data usage" },
  { id: "low", label: "Low", desc: "Saves data on slow connections" },
];

export default function PlaybackSettingsView({ onBack }: { onBack: () => void }) {
  const { playback, updatePlayback } = useApp();
  const accent = useAccent();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-bold text-white">Playback Settings</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-8">
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Video Quality</h3>
          <div className="space-y-2">
            {QUALITIES.map((q) => (
              <button
                key={q.id}
                onClick={() => updatePlayback({ preferredQuality: q.id })}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left ${
                  playback.preferredQuality === q.id ? `${accent.border} ${accent.bgSoft}` : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-white">{q.label}</span>
                  <span className="block text-[11px] text-neutral-500">{q.desc}</span>
                </span>
                <span className={`h-4 w-4 rounded-full border-2 ${playback.preferredQuality === q.id ? `${accent.bg} border-transparent` : "border-white/30"}`} />
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Buffer Size</h3>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
              <span>Low latency</span>
              <span className="font-semibold text-white">{playback.bufferSeconds}s</span>
              <span>Stable</span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              value={playback.bufferSeconds}
              onChange={(e) => updatePlayback({ bufferSeconds: Number(e.target.value) })}
              className="w-full accent-orange-500"
            />
            <p className="mt-2 text-[11px] text-neutral-500">Higher buffer reduces stuttering on unstable connections at the cost of a short delay.</p>
          </div>
        </section>

        <section className="space-y-3">
          <Toggle
            label="Autoplay channels"
            description="Start streaming immediately when a channel is selected"
            checked={playback.autoplay}
            onChange={(v) => updatePlayback({ autoplay: v })}
          />
          <Toggle
            label="Hardware decoding"
            description="Use the device's hardware decoder when available for smoother playback"
            checked={playback.hardwareDecoding}
            onChange={(v) => updatePlayback({ hardwareDecoding: v })}
          />
        </section>
      </div>
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  const accent = useAccent();
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="block text-[11px] text-neutral-500">{description}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? accent.bg : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
