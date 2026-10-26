import { useState, type ReactNode } from "react";
import { ArrowLeft, Loader2, Radio, Server } from "lucide-react";
import { useApp } from "../../state/AppContext";
import type { ServerConfig, ServerType } from "../../types";
import { useAccent } from "../../lib/accent";
import { httpsUrlError } from "../../lib/urlSecurity";

export default function ServerForm({ onBack, onSaved }: { onBack: () => void; onSaved: () => void }) {
  const { addServer } = useApp();
  const accent = useAccent();
  const [type, setType] = useState<Exclude<ServerType, "free">>("xtream");
  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");
  const [epgUrl, setEpgUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (type === "xtream" && (!host || !username || !password)) {
      setError("Please fill in the server host, username and password.");
      return;
    }
    if (type === "xtream") {
      const urlError = httpsUrlError(host, "Server host");
      if (urlError) {
        setError(urlError);
        return;
      }
    }
    if (type === "m3u" && !m3uUrl) {
      setError("Please provide a playlist URL.");
      return;
    }
    if (type === "m3u") {
      const urlError = httpsUrlError(m3uUrl, "Playlist URL");
      if (urlError) {
        setError(urlError);
        return;
      }
      if (epgUrl.trim()) {
        const epgError = httpsUrlError(epgUrl, "EPG URL");
        if (epgError) {
          setError(epgError);
          return;
        }
      }
    }
    setSubmitting(true);
    const server: ServerConfig = {
      id: `${type}-${Date.now()}`,
      name: name.trim() || (type === "xtream" ? "Xtream Server" : "M3U Playlist"),
      type,
      host: type === "xtream" ? host.trim() : undefined,
      username: type === "xtream" ? username.trim() : undefined,
      password: type === "xtream" ? password.trim() : undefined,
      m3uUrl: type === "m3u" ? m3uUrl.trim() : undefined,
      epgUrl: type === "m3u" && epgUrl.trim() ? epgUrl.trim() : undefined,
      createdAt: Date.now(),
    };
    try {
      await addServer(server);
      onSaved();
    } catch (e: any) {
      setError(e?.message || "Failed to add server");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pb-2 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="text-base font-bold text-white">Add IPTV Server</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="mb-4 flex rounded-xl bg-white/5 p-1">
          <button
            onClick={() => setType("xtream")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${type === "xtream" ? `${accent.bg} text-black` : "text-neutral-400"}`}
          >
            Xtream Codes API
          </button>
          <button
            onClick={() => setType("m3u")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${type === "m3u" ? `${accent.bg} text-black` : "text-neutral-400"}`}
          >
            M3U Playlist
          </button>
        </div>

        <div className="space-y-3">
          <Field label="Server Name (optional)">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="My IPTV Service" className={inputClass} />
          </Field>

          {type === "xtream" ? (
            <>
              <Field label="Server Host / Portal URL">
                <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="https://your-provider.com:8080" className={inputClass} />
              </Field>
              <Field label="Username">
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className={inputClass} />
              </Field>
              <Field label="Password">
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" className={inputClass} />
              </Field>
              <p className="flex items-start gap-1.5 text-[11px] text-neutral-500">
                <Server className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Uses your provider&apos;s HTTPS Xtream API. CloudTV does not supply provider access or channel lists.
              </p>
            </>
          ) : (
            <>
              <Field label="Playlist URL (.m3u / .m3u8)">
                <input value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} placeholder="https://example.com/playlist.m3u" className={inputClass} />
              </Field>
              <Field label="EPG / XMLTV URL (optional)">
                <input value={epgUrl} onChange={(e) => setEpgUrl(e.target.value)} placeholder="https://example.com/epg.xml" className={inputClass} />
              </Field>
              <p className="flex items-start gap-1.5 text-[11px] text-neutral-500">
                <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Use only a provider-issued HTTPS playlist you are authorized to access.
              </p>
            </>
          )}

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-black disabled:opacity-60 ${accent.bg}`}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Connecting…" : "Connect for this session"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-orange-500/50 focus:outline-none";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
