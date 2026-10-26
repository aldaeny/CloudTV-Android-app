import { Capacitor } from "@capacitor/core";
import {
  KeychainAccess,
  SecureStorage,
} from "@aparajita/capacitor-secure-storage";
import type { ServerConfig } from "../types";
import { isHttpsUrl } from "./urlSecurity";

const STORAGE_KEY = "provider-state-v1";
const STORAGE_PREFIX = "cloudtv";
const LEGACY_STORAGE_KEY = "iptv-client-state-v1";

export interface ProviderState {
  servers: ServerConfig[];
  activeServerId: string | null;
}

let nativeStorageReady: Promise<void> | undefined;

function isServerConfig(value: unknown): value is ServerConfig {
  if (!value || typeof value !== "object") return false;
  const server = value as Partial<ServerConfig>;
  if (typeof server.id !== "string" || typeof server.name !== "string") {
    return false;
  }
  if (server.type === "m3u") {
    return typeof server.m3uUrl === "string" && isHttpsUrl(server.m3uUrl);
  }
  if (server.type === "xtream") {
    return (
      typeof server.host === "string" &&
      isHttpsUrl(server.host) &&
      typeof server.username === "string" &&
      typeof server.password === "string"
    );
  }
  return false;
}

function parseProviderState(value: unknown): ProviderState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const servers = Array.isArray(record.servers)
    ? record.servers.filter(isServerConfig)
    : [];
  const requestedActiveId =
    typeof record.activeServerId === "string" ? record.activeServerId : null;

  return {
    servers,
    activeServerId: servers.some((server) => server.id === requestedActiveId)
      ? requestedActiveId
      : (servers[0]?.id ?? null),
  };
}

function readLegacyProviderState(): ProviderState | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? parseProviderState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function clearLegacyProviderState() {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function ensureNativeStorage() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("Secure provider storage is available only in the mobile app.");
  }

  nativeStorageReady ??= (async () => {
    await SecureStorage.setKeyPrefix(STORAGE_PREFIX);
    await SecureStorage.setDefaultKeychainAccess(
      KeychainAccess.whenUnlockedThisDeviceOnly,
    );
  })();

  await nativeStorageReady;
}

export async function loadProviderState(): Promise<ProviderState> {
  if (!Capacitor.isNativePlatform()) {
    return { servers: [], activeServerId: null };
  }

  await ensureNativeStorage();
  const stored = await SecureStorage.get(STORAGE_KEY);
  if (stored !== null) {
    const parsed = parseProviderState(stored);
    if (parsed) {
      clearLegacyProviderState();
      return parsed;
    }
  }

  const legacy = readLegacyProviderState();
  if (!legacy) return { servers: [], activeServerId: null };

  await SecureStorage.set(STORAGE_KEY, legacy);
  clearLegacyProviderState();
  return legacy;
}

export async function saveProviderState(state: ProviderState): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await ensureNativeStorage();
  await SecureStorage.set(STORAGE_KEY, {
    servers: state.servers,
    activeServerId: state.activeServerId,
  });
}
