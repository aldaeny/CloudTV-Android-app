import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  PlusCircle,
  RefreshCw,
  Server,
  SlidersHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { useAccent } from "../lib/accent";
import ServerForm from "./settings/ServerForm";
import PlaybackSettingsView from "./settings/PlaybackSettingsView";
import AppearanceSettingsView from "./settings/AppearanceSettingsView";

type View = "root" | "addServer" | "playback" | "appearance";

export default function SettingsScreen({ jumpToAddServer, onConsumeJump }: { jumpToAddServer?: boolean; onConsumeJump?: () => void }) {
  const { servers, activeServer, setActiveServer, removeServer, refreshServerChannels, loadingServerId, channelsByServer, connection } = useApp();
  const [view, setView] = useState<View>("root");
  const accent = useAccent();

  useEffect(() => {
    if (jumpToAddServer) {
      setView("addServer");
      onConsumeJump?.();
    }
  }, [jumpToAddServer, onConsumeJump]);

  if (view === "addServer") return <ServerForm onBack={() => setView("root")} onSaved={() => setView("root")} />;
  if (view === "playback") return <PlaybackSettingsView onBack={() => setView("root")} />;
  if (view === "appearance") return <AppearanceSettingsView onBack={() => setView("root")} />;

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-10">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500">IPTV Servers</h3>
          <button onClick={() => setView("addServer")} className={`flex items-center gap-1 text-xs font-semibold ${accent.text}`}>
            <PlusCircle className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {servers.map((s) => {
            const isActive = s.id === activeServer?.id;
            const count = channelsByServer[s.id]?.length;
            const isLoading = loadingServerId === s.id;
            return (
              <div key={s.id} className={`rounded-xl border p-3 ${isActive ? `${accent.border} ${accent.bgSoft}` : "border-white/10 bg-white/[0.03]"}`}>
                <button onClick={() => setActiveServer(s.id)} className="flex w-full items-center gap-3 text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Server className="h-5 w-5 text-neutral-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                    <p className="truncate text-[11px] text-neutral-500">
                      {s.type === "xtream" ? "Xtream Codes API" : "M3U Playlist"}
                      {typeof count === "number" ? ` · ${count} channels` : ""}
                    </p>
                  </div>
                  {isActive && (connection.status === "connected" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : connection.status === "error" ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : null)}
                </button>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => refreshServerChannels(s.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-300 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} /> Refresh
                  </button>
                  <button
                    onClick={() => removeServer(s.id)}
                    className="ml-auto flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] font-medium text-red-400"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                {isActive && connection.status === "error" && connection.message && (
                  <p className="mt-2 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-400">{connection.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Preferences</h3>
        <div className="space-y-2">
          <SettingsRow icon={SlidersHorizontal} label="Playback & Quality" onClick={() => setView("playback")} />
          <SettingsRow icon={Layers} label="Appearance" onClick={() => setView("appearance")} />
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">About</h3>
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2 text-white">
            <Info className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-semibold">CloudTV IPTV Client · v1.0.0</span>
          </div>
          <p>CloudTV does not provide channel lists or verify provider authorization. Add only a playlist or Xtream account you are authorized to use.</p>
          <p>
            {Capacitor.isNativePlatform()
              ? "Provider details are saved using encrypted device storage."
              : "Provider details stay in memory for this browser session and are not saved by this web preview."}
          </p>
        </div>
      </section>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, onClick }: { icon: typeof Info; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left">
      <Icon className="h-4 w-4 text-neutral-400" />
      <span className="flex-1 text-sm font-medium text-white">{label}</span>
      <ChevronRight className="h-4 w-4 text-neutral-600" />
    </button>
  );
}
