import { useState } from "react";
import { Tv } from "lucide-react";

export default function ChannelLogo({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-neutral-800 text-neutral-500 ${className || ""}`}>
        <Tv className="h-1/2 w-1/2" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className || ""}`}
    />
  );
}
