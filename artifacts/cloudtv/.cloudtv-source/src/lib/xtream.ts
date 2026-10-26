import type { Channel, EPGProgram, ServerConfig } from "../types";

function normalizeHost(host: string): string {
  let h = host.trim();
  if (!/^https?:\/\//i.test(h)) h = `http://${h}`;
  return h.replace(/\/+$/, "");
}

export interface XtreamAccountInfo {
  authenticated: boolean;
  status?: string;
  expDate?: string;
  isTrial?: boolean;
  maxConnections?: string;
  serverUrl?: string;
}

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Server responded with ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Unexpected response from server (not valid JSON)");
  }
}

export function buildPlayerApiUrl(server: ServerConfig, params: Record<string, string>): string {
  const host = normalizeHost(server.host || "");
  const query = new URLSearchParams({
    username: server.username || "",
    password: server.password || "",
    ...params,
  });
  return `${host}/player_api.php?${query.toString()}`;
}

export async function verifyXtreamAccount(server: ServerConfig): Promise<XtreamAccountInfo> {
  const url = buildPlayerApiUrl(server, {});
  const data = await fetchJson(url);
  const userInfo = data?.user_info;
  if (!userInfo) throw new Error("Invalid response: missing account information");
  if (userInfo.auth === 0) {
    throw new Error("Authentication failed. Check username and password.");
  }
  return {
    authenticated: userInfo.auth === 1,
    status: userInfo.status,
    expDate: userInfo.exp_date,
    isTrial: userInfo.is_trial === "1",
    maxConnections: userInfo.max_connections,
    serverUrl: data?.server_info?.url,
  };
}

export async function fetchXtreamCategories(server: ServerConfig): Promise<{ id: string; name: string }[]> {
  const url = buildPlayerApiUrl(server, { action: "get_live_categories" });
  const data = await fetchJson(url);
  if (!Array.isArray(data)) return [];
  return data.map((c: any) => ({ id: String(c.category_id), name: c.category_name }));
}

export async function fetchXtreamChannels(server: ServerConfig): Promise<Channel[]> {
  const url = buildPlayerApiUrl(server, { action: "get_live_streams" });
  const data = await fetchJson(url);
  if (!Array.isArray(data)) return [];
  const host = normalizeHost(server.host || "");
  return data.map((s: any) => {
    const ext = s.container_extension || "m3u8";
    const streamUrl = `${host}/live/${server.username}/${server.password}/${s.stream_id}.${ext}`;
    return {
      id: `${server.id}-${s.stream_id}`,
      name: s.name,
      logo: s.stream_icon,
      group: s.category_name || "General",
      streamUrl,
      tvgId: s.epg_channel_id,
      epgChannelId: s.epg_channel_id,
      serverId: server.id,
      isRadio: false,
    } as Channel;
  });
}

export async function fetchXtreamShortEPG(server: ServerConfig, streamId: string): Promise<EPGProgram[]> {
  const url = buildPlayerApiUrl(server, { action: "get_short_epg", stream_id: streamId });
  const data = await fetchJson(url);
  const list = data?.epg_listings;
  if (!Array.isArray(list)) return [];
  return list.map((e: any, idx: number) => {
    const start = Date.parse(e.start.replace(" ", "T") + "Z");
    const end = Date.parse(e.end.replace(" ", "T") + "Z");
    let title = e.title;
    let description = e.description;
    try {
      title = atob(e.title);
    } catch {
      /* already plain text */
    }
    try {
      description = e.description ? atob(e.description) : undefined;
    } catch {
      /* already plain text */
    }
    return {
      id: `${streamId}-${idx}`,
      channelId: streamId,
      title,
      description,
      start,
      end,
    } as EPGProgram;
  });
}

export function xtreamXmltvUrl(server: ServerConfig): string {
  const host = normalizeHost(server.host || "");
  return `${host}/xmltv.php?username=${encodeURIComponent(server.username || "")}&password=${encodeURIComponent(server.password || "")}`;
}
