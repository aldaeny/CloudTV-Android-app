import Hls from "hls.js";
import { toXtreamHlsUrl } from "../lib/xtream";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onError?: (message: string) => void;
  onPlaying?: () => void;
  controlsOverlay?: React.ReactNode;
  bufferSeconds?: number;
  quality?: "auto" | "high" | "medium" | "low";
}

const MAX_RETRIES = 3;

export default function VideoPlayer({
  src: rawSrc,
  autoPlay = true,
  muted = false,
  className,
  onError,
  onPlaying,
  controlsOverlay,
  bufferSeconds = 6,
  quality = "auto",
}: VideoPlayerProps) {
  const src = rawSrc ? toXtreamHlsUrl(rawSrc) : rawSrc;
  const [attempt, setAttempt] = useState(0);
  const retriesRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    retriesRef.current = 0;
    setAttempt(0);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setStatus("loading");
    setErrorMsg("");
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let mediaRecoveries = 0;
    const failWithRetry = (msg: string) => {
      if (retriesRef.current < MAX_RETRIES) {
        retriesRef.current += 1;
        setStatus("loading");
        retryTimer = setTimeout(() => setAttempt((a) => a + 1), 1500 * retriesRef.current);
        return;
      }
      setStatus("error");
      setErrorMsg(msg);
      onError?.(msg);
    };

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = /\.m3u8($|\?)/i.test(src);

    function handlePlaying() {
      retriesRef.current = 0;
      setStatus("ready");
      onPlaying?.();
    }
    function handleWaiting() {
      setStatus("loading");
    }

    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: Math.max(4, bufferSeconds),
        enableWorker: true,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (quality !== "auto" && hls.levels.length > 1) {
          const sorted = [...hls.levels.keys()].sort((a, b) => hls.levels[a].height - hls.levels[b].height);
          if (quality === "low") hls.currentLevel = sorted[0];
          else if (quality === "medium") hls.currentLevel = sorted[Math.floor(sorted.length / 2)];
          else if (quality === "high") hls.currentLevel = sorted[sorted.length - 1];
        }
        if (autoPlay) video.play().catch(() => undefined);
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          let msg = "Playback failed. The stream may be offline.";
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            msg = "Network error while loading the stream. Check your connection or try another channel.";
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            msg = "Media error while decoding the stream.";
            if (mediaRecoveries < 2) {
              mediaRecoveries += 1;
              hls.recoverMediaError();
              return;
            }
          }
          hls.destroy();
          failWithRetry(msg);
        }
      });
    } else {
      // Native playback: direct mp4/ts streams or Safari's native HLS support
      video.src = src;
      if (autoPlay) {
        video.play().catch(() => undefined);
      }
      const handleNativeError = () => {
        const msg = "Unable to play this stream. The source may be offline or unsupported.";
        failWithRetry(msg);
      };
      video.addEventListener("error", handleNativeError);
      return () => {
        clearTimeout(retryTimer);
        video.removeEventListener("error", handleNativeError);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("waiting", handleWaiting);
      };
    }

    return () => {
      clearTimeout(retryTimer);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay, bufferSeconds, quality, attempt]);

  return (
    <div className={`relative overflow-hidden bg-black ${className || ""}`}>
      <video ref={videoRef} muted={muted} playsInline className="h-full w-full object-contain" />
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF8A24]" />
          <span className="text-xs text-neutral-300">Connecting to stream…</span>
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
          <WifiOff className="h-8 w-8 text-red-500" />
          <span className="text-sm font-medium text-white">Playback error</span>
          <span className="text-xs text-neutral-400">{errorMsg}</span>
          <button
            autoFocus
            onClick={() => {
              retriesRef.current = 0;
              setAttempt((a) => a + 1);
            }}
            className="mt-2 flex items-center gap-2 rounded-full bg-[#FF3B45] px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#35D6F2]"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}
      {controlsOverlay}
    </div>
  );
}
