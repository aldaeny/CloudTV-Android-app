import { Star } from "lucide-react";
import { useApp } from "../state/AppContext";
import { useResolvedChannels } from "../hooks/useResolvedChannels";
import ChannelListItem from "../components/ChannelListItem";
import EmptyState from "../components/EmptyState";
import type { Channel } from "../types";

export default function FavoritesScreen({ onPlay }: { onPlay: (c: Channel, list: Channel[]) => void }) {
  const { favorites } = useApp();
  const favoriteChannels = useResolvedChannels(favorites);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      {favoriteChannels.length === 0 ? (
        <EmptyState
          icon={<Star className="h-8 w-8" />}
          title="No favorites yet"
          subtitle="Tap the star icon on any channel to add it to your favorites for quick access."
        />
      ) : (
        <div className="space-y-2 pt-2">
          {favoriteChannels.map((c) => (
            <ChannelListItem key={c.id} channel={c} onPlay={(ch) => onPlay(ch, favoriteChannels)} />
          ))}
        </div>
      )}
    </div>
  );
}
