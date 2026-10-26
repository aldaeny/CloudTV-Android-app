import { ArrowLeft, Check } from "lucide-react";
import { useApp } from "../../state/AppContext";
import { useAccent } from "../../lib/accent";

const ACCENTS: { id: "orange" | "red" | "blue" | "green" | "purple"; swatch: string }[] = [
  { id: "orange", swatch: "bg-orange-500" },
  { id: "red", swatch: "bg-red-500" },
  { id: "blue", swatch: "bg-blue-500" },
  { id: "green", swatch: "bg-emerald-500" },
  { id: "purple", swatch: "bg-violet-500" },
];

const THEMES: { id: "dark" | "midnight" | "amoled"; label: string; desc: string }[] = [
  { id: "dark", label: "Dark", desc: "Classic dark gray background" },
  { id: "midnight", label: "Midnight Blue", desc: "Deep navy tones" },
  { id: "amoled", label: "AMOLED Black", desc: "Pure black, battery friendly" },
];

export default function AppearanceSettingsView({ onBack }: { onBack: () => void }) {
  const { appearance, updateAppearance } = useApp();
  const accent = useAccent();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-bold text-white">Appearance</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-8">
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Accent Color</h3>
          <div className="flex gap-3">
            {ACCENTS.map((a) => (
              <button key={a.id} onClick={() => updateAppearance({ accent: a.id })} className="flex flex-col items-center gap-1.5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-full ${a.swatch}`}>
                  {appearance.accent === a.id && <Check className="h-5 w-5 text-black" />}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Theme</h3>
          <div className="space-y-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => updateAppearance({ theme: t.id })}
                className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left ${
                  appearance.theme === t.id ? `${accent.border} ${accent.bgSoft}` : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-white">{t.label}</span>
                  <span className="block text-[11px] text-neutral-500">{t.desc}</span>
                </span>
                {appearance.theme === t.id && <Check className={`h-4 w-4 ${accent.text}`} />}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Channel List Density</h3>
          <div className="flex rounded-xl bg-white/5 p-1">
            <button
              onClick={() => updateAppearance({ gridDensity: "comfortable" })}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold ${appearance.gridDensity === "comfortable" ? `${accent.bg} text-black` : "text-neutral-400"}`}
            >
              Comfortable
            </button>
            <button
              onClick={() => updateAppearance({ gridDensity: "compact" })}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold ${appearance.gridDensity === "compact" ? `${accent.bg} text-black` : "text-neutral-400"}`}
            >
              Compact
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
