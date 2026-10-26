export interface FreeSourceOption {
  id: string;
  label: string;
  flag: string;
  url: string;
  kind: "country" | "category";
}

// Curated set of publicly available, royalty-free IPTV playlists from the
// community-maintained iptv-org project (https://github.com/iptv-org/iptv).
// These require no username/password - they are free-to-air public streams.
export const FREE_SOURCE_OPTIONS: FreeSourceOption[] = [
  { id: "us", label: "United States", flag: "🇺🇸", url: "https://iptv-org.github.io/iptv/countries/us.m3u", kind: "country" },
  { id: "uk", label: "United Kingdom", flag: "🇬🇧", url: "https://iptv-org.github.io/iptv/countries/uk.m3u", kind: "country" },
  { id: "ca", label: "Canada", flag: "🇨🇦", url: "https://iptv-org.github.io/iptv/countries/ca.m3u", kind: "country" },
  { id: "fr", label: "France", flag: "🇫🇷", url: "https://iptv-org.github.io/iptv/countries/fr.m3u", kind: "country" },
  { id: "de", label: "Germany", flag: "🇩🇪", url: "https://iptv-org.github.io/iptv/countries/de.m3u", kind: "country" },
  { id: "es", label: "Spain", flag: "🇪🇸", url: "https://iptv-org.github.io/iptv/countries/es.m3u", kind: "country" },
  { id: "it", label: "Italy", flag: "🇮🇹", url: "https://iptv-org.github.io/iptv/countries/it.m3u", kind: "country" },
  { id: "in", label: "India", flag: "🇮🇳", url: "https://iptv-org.github.io/iptv/countries/in.m3u", kind: "country" },
  { id: "br", label: "Brazil", flag: "🇧🇷", url: "https://iptv-org.github.io/iptv/countries/br.m3u", kind: "country" },
  { id: "ae", label: "United Arab Emirates", flag: "🇦🇪", url: "https://iptv-org.github.io/iptv/countries/ae.m3u", kind: "country" },
  { id: "mx", label: "Mexico", flag: "🇲🇽", url: "https://iptv-org.github.io/iptv/countries/mx.m3u", kind: "country" },
  { id: "jp", label: "Japan", flag: "🇯🇵", url: "https://iptv-org.github.io/iptv/countries/jp.m3u", kind: "country" },
  { id: "news", label: "News (Worldwide)", flag: "📰", url: "https://iptv-org.github.io/iptv/categories/news.m3u", kind: "category" },
  { id: "sports", label: "Sports (Worldwide)", flag: "⚽", url: "https://iptv-org.github.io/iptv/categories/sports.m3u", kind: "category" },
  { id: "movies", label: "Movies (Worldwide)", flag: "🎬", url: "https://iptv-org.github.io/iptv/categories/movies.m3u", kind: "category" },
  { id: "music", label: "Music (Worldwide)", flag: "🎵", url: "https://iptv-org.github.io/iptv/categories/music.m3u", kind: "category" },
  { id: "kids", label: "Kids (Worldwide)", flag: "🧸", url: "https://iptv-org.github.io/iptv/categories/kids.m3u", kind: "category" },
  { id: "documentary", label: "Documentary", flag: "🌍", url: "https://iptv-org.github.io/iptv/categories/documentary.m3u", kind: "category" },
  { id: "entertainment", label: "Entertainment", flag: "✨", url: "https://iptv-org.github.io/iptv/categories/entertainment.m3u", kind: "category" },
  { id: "classic", label: "Classic TV", flag: "📺", url: "https://iptv-org.github.io/iptv/categories/classic.m3u", kind: "category" },
];

export const DEFAULT_FREE_SOURCE_IDS = ["us", "news", "movies"];

export const FREE_SERVER_ID = "free-iptv-org";
