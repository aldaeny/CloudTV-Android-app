import { ChevronDown, Search, Wifi, WifiOff } from "lucide-react";
import type { ConnectionState, ServerConfig } from "../types";

export default function TopBar({
  title,
  server,
  connection,
  onSearch,
  onServerSwitch,
}: {
  title: string;
  server: ServerConfig | null;
  connection: ConnectionState;
  onSearch?: () => void;
  onServerSwitch?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-white">{title}</h1>
        <button onClick={onServerSwitch} className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-400">
          {connection.status === "connected" ? (
            <Wifi className="h-3 w-3 text-emerald-500" />
          ) : connection.status === "error" ? (
            <WifiOff className="h-3 w-3 text-red-500" />
          ) : (
            <Wifi className="h-3 w-3 animate-pulse text-amber-500" />
          )}
          <span className="max-w-[150px] truncate">{server?.name || "No server selected"}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        {onSearch && (
          <button onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-neutral-200 active:scale-95">
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
