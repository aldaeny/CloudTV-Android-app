import type { ReactNode } from "react";

export default function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-neutral-500">{icon}</div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {subtitle && <p className="max-w-[240px] text-xs text-neutral-500">{subtitle}</p>}
      {action}
    </div>
  );
}
