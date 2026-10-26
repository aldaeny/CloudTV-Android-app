import { useEffect, useState } from "react";
import { AppProvider, useApp } from "./state/AppContext";
import type { Tab } from "./navigation";
import type { Channel } from "./types";
import SplashScreen from "./screens/SplashScreen";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";
import HomeScreen from "./screens/HomeScreen";
import LiveTVScreen from "./screens/LiveTVScreen";
import GuideScreen from "./screens/GuideScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import SettingsScreen from "./screens/SettingsScreen";
import PlayerOverlay from "./components/PlayerOverlay";
import SearchOverlay from "./components/SearchOverlay";

const TAB_TITLES: Record<Tab, string> = {
  home: "CloudTV",
  live: "Live TV",
  guide: "TV Guide",
  favorites: "Favorites",
  settings: "Settings",
};

const THEME_BG: Record<string, string> = {
  dark: "bg-[#0b0d12]",
  midnight: "bg-[#070b16]",
  amoled: "bg-black",
};

function Shell() {
  const { activeServer, connection, appearance } = useApp();
  const [tab, setTab] = useState<Tab>("home");
  const [playing, setPlaying] = useState<{ channel: Channel; list: Channel[] } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [jumpToAddServer, setJumpToAddServer] = useState(false);

  function handlePlay(channel: Channel, list: Channel[]) {
    setPlaying({ channel, list });
    setSearchOpen(false);
  }

  function handleBrowseCategory(_id: string) {
    setTab("live");
  }

  const bgClass = THEME_BG[appearance.theme] || THEME_BG.dark;

  return (
    <div className={`relative flex h-full flex-col overflow-hidden ${bgClass}`}>
      <TopBar
        title={TAB_TITLES[tab]}
        server={activeServer}
        connection={connection}
        onSearch={() => setSearchOpen(true)}
        onServerSwitch={() => setTab("settings")}
      />

      <div className="relative flex-1 overflow-hidden">
        {tab === "home" && (
          <HomeScreen
            onBrowseCategory={handleBrowseCategory}
            onPlay={handlePlay}
            onAddServer={() => {
              setTab("settings");
              setJumpToAddServer(true);
            }}
          />
        )}
        {tab === "live" && <LiveTVScreen onPlay={handlePlay} currentChannelId={playing?.channel.id} />}
        {tab === "guide" && <GuideScreen onPlay={handlePlay} />}
        {tab === "favorites" && <FavoritesScreen onPlay={handlePlay} />}
        {tab === "settings" && <SettingsScreen jumpToAddServer={jumpToAddServer} onConsumeJump={() => setJumpToAddServer(false)} />}

        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onPlay={handlePlay} />}

        {playing && (
          <PlayerOverlay
            channel={playing.channel}
            channels={playing.list}
            onClose={() => setPlaying(null)}
            onSelectChannel={(c) => setPlaying({ channel: c, list: playing.list })}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

function AppInner() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black md:p-6">
      <div className="relative h-screen w-full overflow-hidden bg-[#0b0d12] text-white shadow-2xl md:h-[900px] md:max-h-[94vh] md:w-[430px] md:rounded-[2.75rem] md:border-[10px] md:border-neutral-900">
        {booting ? <SplashScreen /> : <Shell />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
