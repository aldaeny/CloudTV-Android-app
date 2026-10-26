import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type {
  AppearanceSettings,
  Channel,
  ConnectionState,
  EPGProgram,
  PlaybackSettings,
  ServerConfig,
} from "../types";
import { parseM3U } from "../lib/m3uParser";
import { parseXMLTV } from "../lib/xmltv";
import {
  fetchXtreamChannels,
  verifyXtreamAccount,
  xtreamXmltvUrl,
} from "../lib/xtream";
import { DEFAULT_FREE_SOURCE_IDS, FREE_SERVER_ID, FREE_SOURCE_OPTIONS } from "../data/freeSources";
import { favoriteKey } from "./favorites";

const STORAGE_KEY = "iptv-client-state-v1";

interface PersistedState {
  servers: ServerConfig[];
  activeServerId: string | null;
  favorites: string[];
  recent: string[];
  freeSourceIds: string[];
  playback: PlaybackSettings;
  appearance: AppearanceSettings;
}

interface AppState extends PersistedState {
  channelsByServer: Record<string, Channel[]>;
  epgByChannel: Record<string, EPGProgram[]>;
  loadingServerId: string | null;
  connection: ConnectionState;
  lastError: string | null;
}

const defaultFreeServer: ServerConfig = {
  id: FREE_SERVER_ID,
  name: "Free Public TV",
  type: "free",
  createdAt: Date.now(),
  color: "orange",
};

const defaultPlayback: PlaybackSettings = {
  autoplay: true,
  preferredQuality: "auto",
  bufferSeconds: 6,
  hardwareDecoding: true,
};

const defaultAppearance: AppearanceSettings = {
  theme: "dark",
  accent: "orange",
  gridDensity: "comfortable",
};

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState;
      if (!parsed.servers?.some((s) => s.id === FREE_SERVER_ID)) {
        parsed.servers = [defaultFreeServer, ...(parsed.servers || [])];
      }
      return {
        servers: parsed.servers,
        activeServerId: parsed.activeServerId ?? FREE_SERVER_ID,
        favorites: parsed.favorites ?? [],
        recent: parsed.recent ?? [],
        freeSourceIds: parsed.freeSourceIds?.length ? parsed.freeSourceIds : DEFAULT_FREE_SOURCE_IDS,
        playback: { ...defaultPlayback, ...parsed.playback },
        appearance: { ...defaultAppearance, ...parsed.appearance },
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return {
    servers: [defaultFreeServer],
    activeServerId: FREE_SERVER_ID,
    favorites: [],
    recent: [],
    freeSourceIds: DEFAULT_FREE_SOURCE_IDS,
    playback: defaultPlayback,
    appearance: defaultAppearance,
  };
}

type Action =
  | { type: "ADD_SERVER"; server: ServerConfig }
  | { type: "UPDATE_SERVER"; server: ServerConfig }
  | { type: "REMOVE_SERVER"; id: string }
  | { type: "SET_ACTIVE_SERVER"; id: string }
  | { type: "SET_CHANNELS"; serverId: string; channels: Channel[] }
  | { type: "SET_LOADING"; serverId: string | null }
  | { type: "SET_CONNECTION"; connection: ConnectionState }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "TOGGLE_FAVORITE"; key: string }
  | { type: "ADD_RECENT"; key: string }
  | { type: "SET_FREE_SOURCES"; ids: string[] }
  | { type: "UPDATE_PLAYBACK"; settings: Partial<PlaybackSettings> }
  | { type: "UPDATE_APPEARANCE"; settings: Partial<AppearanceSettings> }
  | { type: "SET_EPG"; map: Record<string, EPGProgram[]> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_SERVER":
      return { ...state, servers: [...state.servers, action.server], activeServerId: action.server.id };
    case "UPDATE_SERVER":
      return {
        ...state,
        servers: state.servers.map((s) => (s.id === action.server.id ? action.server : s)),
      };
    case "REMOVE_SERVER": {
      const servers = state.servers.filter((s) => s.id !== action.id);
      const { [action.id]: _removed, ...rest } = state.channelsByServer;
      return {
        ...state,
        servers,
        channelsByServer: rest,
        activeServerId: state.activeServerId === action.id ? servers[0]?.id ?? null : state.activeServerId,
      };
    }
    case "SET_ACTIVE_SERVER":
      return { ...state, activeServerId: action.id };
    case "SET_CHANNELS":
      return {
        ...state,
        channelsByServer: { ...state.channelsByServer, [action.serverId]: action.channels },
      };
    case "SET_LOADING":
      return { ...state, loadingServerId: action.serverId };
    case "SET_CONNECTION":
      return { ...state, connection: action.connection };
    case "SET_ERROR":
      return { ...state, lastError: action.error };
    case "TOGGLE_FAVORITE": {
      const exists = state.favorites.includes(action.key);
      return {
        ...state,
        favorites: exists ? state.favorites.filter((f) => f !== action.key) : [...state.favorites, action.key],
      };
    }
    case "ADD_RECENT": {
      const filtered = state.recent.filter((r) => r !== action.key);
      return { ...state, recent: [action.key, ...filtered].slice(0, 20) };
    }
    case "SET_FREE_SOURCES":
      return { ...state, freeSourceIds: action.ids };
    case "UPDATE_PLAYBACK":
      return { ...state, playback: { ...state.playback, ...action.settings } };
    case "UPDATE_APPEARANCE":
      return { ...state, appearance: { ...state.appearance, ...action.settings } };
    case "SET_EPG":
      return { ...state, epgByChannel: { ...state.epgByChannel, ...action.map } };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  activeServer: ServerConfig | null;
  activeChannels: Channel[];
  isChannelFavorite: (c: Channel) => boolean;
  toggleFavorite: (c: Channel) => void;
  addRecent: (c: Channel) => void;
  setActiveServer: (id: string) => void;
  addServer: (server: ServerConfig) => Promise<void>;
  updateServer: (server: ServerConfig) => void;
  removeServer: (id: string) => void;
  refreshServerChannels: (serverId: string) => Promise<void>;
  setFreeSources: (ids: string[]) => void;
  updatePlayback: (s: Partial<PlaybackSettings>) => void;
  updateAppearance: (s: Partial<AppearanceSettings>) => void;
  loadEpgForServer: (serverId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...loadPersisted(),
    channelsByServer: {},
    epgByChannel: {},
    loadingServerId: null,
    connection: { status: "idle" } as ConnectionState,
    lastError: null,
  }));

  const persistRef = useRef(state);
  persistRef.current = state;

  useEffect(() => {
    const persisted: PersistedState = {
      servers: state.servers,
      activeServerId: state.activeServerId,
      favorites: state.favorites,
      recent: state.recent,
      freeSourceIds: state.freeSourceIds,
      playback: state.playback,
      appearance: state.appearance,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      /* storage full or unavailable - ignore */
    }
  }, [state.servers, state.activeServerId, state.favorites, state.recent, state.freeSourceIds, state.playback, state.appearance]);

  const refreshServerChannels = useCallback(
    async (serverId: string) => {
      const server = persistRef.current.servers.find((s) => s.id === serverId);
      if (!server) return;
      dispatch({ type: "SET_LOADING", serverId });
      dispatch({ type: "SET_CONNECTION", connection: { status: "connecting" } });
      dispatch({ type: "SET_ERROR", error: null });
      try {
        let channels: Channel[] = [];
        if (server.type === "free") {
          const ids = persistRef.current.freeSourceIds.length ? persistRef.current.freeSourceIds : DEFAULT_FREE_SOURCE_IDS;
          const sources = FREE_SOURCE_OPTIONS.filter((o) => ids.includes(o.id));
          const results = await Promise.allSettled(
            sources.map(async (src) => {
              const res = await fetch(src.url);
              if (!res.ok) throw new Error(`Failed to load ${src.label}`);
              const text = await res.text();
              return parseM3U(text, server.id, src.url);
            }),
          );
          const successful = results.filter((r): r is PromiseFulfilledResult<Channel[]> => r.status === "fulfilled");
          if (successful.length === 0) {
            throw new Error("Unable to reach the free channel sources. Check your internet connection.");
          }
          channels = successful.flatMap((r) => r.value);
        } else if (server.type === "m3u") {
          if (!server.m3uUrl) throw new Error("Missing playlist URL");
          const res = await fetch(server.m3uUrl);
          if (!res.ok) throw new Error(`Playlist request failed (HTTP ${res.status})`);
          const text = await res.text();
          channels = parseM3U(text, server.id, server.m3uUrl);
          if (channels.length === 0) throw new Error("The playlist did not contain any channels.");
        } else if (server.type === "xtream") {
          if (!server.host || !server.username || !server.password) {
            throw new Error("Missing Xtream Codes credentials");
          }
          await verifyXtreamAccount(server);
          channels = await fetchXtreamChannels(server);
        }
        dispatch({ type: "SET_CHANNELS", serverId, channels });
        dispatch({ type: "SET_CONNECTION", connection: { status: "connected" } });
        dispatch({
          type: "UPDATE_SERVER",
          server: { ...server, lastUsedAt: Date.now() },
        });
      } catch (err: any) {
        const message = err?.message || "Failed to connect to server";
        dispatch({ type: "SET_CONNECTION", connection: { status: "error", message } });
        dispatch({ type: "SET_ERROR", error: message });
      } finally {
        dispatch({ type: "SET_LOADING", serverId: null });
      }
    },
    [],
  );

  const loadEpgForServer = useCallback(async (serverId: string) => {
    const server = persistRef.current.servers.find((s) => s.id === serverId);
    if (!server) return;
    try {
      let xmlUrl: string | undefined;
      if (server.type === "xtream") {
        xmlUrl = xtreamXmltvUrl(server);
      } else if (server.type === "m3u" && server.epgUrl) {
        xmlUrl = server.epgUrl;
      }
      if (!xmlUrl) return;
      const res = await fetch(xmlUrl);
      if (!res.ok) return;
      const text = await res.text();
      const map = parseXMLTV(text);
      const plain: Record<string, EPGProgram[]> = {};
      map.forEach((v, k) => (plain[k] = v));
      dispatch({ type: "SET_EPG", map: plain });
    } catch {
      /* EPG is optional - fail silently */
    }
  }, []);

  const addServer = useCallback(
    async (server: ServerConfig) => {
      dispatch({ type: "ADD_SERVER", server });
      await refreshServerChannels(server.id);
      await loadEpgForServer(server.id);
    },
    [refreshServerChannels, loadEpgForServer],
  );

  const updateServer = useCallback((server: ServerConfig) => {
    dispatch({ type: "UPDATE_SERVER", server });
  }, []);

  const removeServer = useCallback((id: string) => {
    dispatch({ type: "REMOVE_SERVER", id });
  }, []);

  const setActiveServer = useCallback((id: string) => {
    dispatch({ type: "SET_ACTIVE_SERVER", id });
  }, []);

  const setFreeSources = useCallback((ids: string[]) => {
    dispatch({ type: "SET_FREE_SOURCES", ids });
  }, []);

  const updatePlayback = useCallback((s: Partial<PlaybackSettings>) => {
    dispatch({ type: "UPDATE_PLAYBACK", settings: s });
  }, []);

  const updateAppearance = useCallback((s: Partial<AppearanceSettings>) => {
    dispatch({ type: "UPDATE_APPEARANCE", settings: s });
  }, []);

  const toggleFavorite = useCallback((c: Channel) => {
    dispatch({ type: "TOGGLE_FAVORITE", key: favoriteKey(c) });
  }, []);

  const addRecent = useCallback((c: Channel) => {
    dispatch({ type: "ADD_RECENT", key: favoriteKey(c) });
  }, []);

  const isChannelFavorite = useCallback((c: Channel) => state.favorites.includes(favoriteKey(c)), [state.favorites]);

  // Bootstrap: load channels for the active server on first mount.
  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const id = state.activeServerId || FREE_SERVER_ID;
    refreshServerChannels(id);
    loadEpgForServer(id);
  }, [refreshServerChannels, loadEpgForServer, state.activeServerId]);

  const activeServer = useMemo(() => state.servers.find((s) => s.id === state.activeServerId) || null, [state.servers, state.activeServerId]);
  const activeChannels = useMemo(() => (activeServer ? state.channelsByServer[activeServer.id] || [] : []), [activeServer, state.channelsByServer]);

  const value: AppContextValue = {
    ...state,
    activeServer,
    activeChannels,
    isChannelFavorite,
    toggleFavorite,
    addRecent,
    setActiveServer,
    addServer,
    updateServer,
    removeServer,
    refreshServerChannels,
    setFreeSources,
    updatePlayback,
    updateAppearance,
    loadEpgForServer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
