export type ServerType = "free" | "xtream" | "m3u";

export interface ServerConfig {
  id: string;
  name: string;
  type: ServerType;
  // Xtream Codes
  host?: string;
  username?: string;
  password?: string;
  // M3U
  m3uUrl?: string;
  epgUrl?: string;
  createdAt: number;
  lastUsedAt?: number;
  color?: string;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group: string;
  streamUrl: string;
  tvgId?: string;
  serverId: string;
  epgChannelId?: string;
  isRadio?: boolean;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface EPGProgram {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  start: number; // epoch ms
  end: number; // epoch ms
  category?: string;
}

export type ContentKind = "live" | "movies" | "series" | "favorites";

export interface PlaybackSettings {
  autoplay: boolean;
  preferredQuality: "auto" | "high" | "medium" | "low";
  bufferSeconds: number;
  hardwareDecoding: boolean;
}

export interface AppearanceSettings {
  theme: "dark" | "midnight" | "amoled";
  accent: "orange" | "red" | "blue" | "green" | "purple";
  gridDensity: "comfortable" | "compact";
}

export interface ConnectionState {
  status: "idle" | "connecting" | "connected" | "error";
  message?: string;
}
