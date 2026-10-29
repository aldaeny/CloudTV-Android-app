import { Tv } from "lucide-react";
import { useAccent } from "../lib/accent";

export default function SplashScreen() {
  const accent = useAccent();
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0A1128]">
      <div className={`flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF3B45] via-[#FF8A24] to-[#885CF6] shadow-lg`}>
        <Tv className="h-10 w-10 text-white" strokeWidth={2.2} />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">CloudTV</h1>
        <p className="text-xs text-neutral-500">Your IPTV, everywhere</p>
      </div>
      <div className="mt-4 h-1 w-28 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#35D6F2] to-[#1769FF]`} />
      </div>
    </div>
  );
}
