import { useApp } from "../state/AppContext";

export interface AccentClasses {
  bg: string;
  bgSoft: string;
  text: string;
  border: string;
  ring: string;
  fill: string;
  gradient: string;
}

const ACCENT_MAP: Record<string, AccentClasses> = {
  orange: {
    bg: "bg-orange-500",
    bgSoft: "bg-orange-500/10",
    text: "text-orange-500",
    border: "border-orange-500/60",
    ring: "ring-orange-500",
    fill: "fill-orange-500",
    gradient: "from-orange-500 to-red-500",
  },
  red: {
    bg: "bg-red-500",
    bgSoft: "bg-red-500/10",
    text: "text-red-500",
    border: "border-red-500/60",
    ring: "ring-red-500",
    fill: "fill-red-500",
    gradient: "from-red-500 to-rose-600",
  },
  blue: {
    bg: "bg-blue-500",
    bgSoft: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/60",
    ring: "ring-blue-500",
    fill: "fill-blue-500",
    gradient: "from-blue-500 to-cyan-500",
  },
  green: {
    bg: "bg-emerald-500",
    bgSoft: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/60",
    ring: "ring-emerald-500",
    fill: "fill-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
  purple: {
    bg: "bg-violet-500",
    bgSoft: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/60",
    ring: "ring-violet-500",
    fill: "fill-violet-500",
    gradient: "from-violet-500 to-fuchsia-500",
  },
};

export function useAccent(): AccentClasses {
  const { appearance } = useApp();
  return ACCENT_MAP[appearance.accent] || ACCENT_MAP.orange;
}
