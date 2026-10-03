"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SAMPLE_CALLS } from "@/lib/aiVoiceRecruiter";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function SampleCallCard({
  title,
  src,
  bars,
  active,
  onActivate,
}: {
  title: string;
  src: string;
  bars: readonly number[];
  active: boolean;
  onActivate: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncDuration = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    syncDuration();
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("loadedmetadata", syncDuration);
    return () => {
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("loadedmetadata", syncDuration);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || active) return;
    audio.pause();
  }, [active]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (active) {
      audio.pause();
      onActivate();
      return;
    }
    document.querySelectorAll<HTMLAudioElement>("audio[data-sample-call]").forEach((node) => {
      if (node !== audio) node.pause();
    });
    onActivate();
    void audio.play().catch(() => undefined);
  }

  function seek(clientX: number, target: HTMLButtonElement) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setCurrent(audio.currentTime);
  }

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <article className="flex flex-col rounded-2xl border border-black/5 bg-white p-4 shadow-[0_10px_30px_rgba(16,24,40,0.04)]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={active ? `Pause ${title} sample` : `Play ${title} sample`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#5b4dff] text-white transition hover:bg-[#4a3de6]"
        >
          {active ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4 translate-x-px" />}
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5b4dff]">Sample call</p>
          <h3 className="truncate text-sm font-semibold text-[#101828]">{title}</h3>
        </div>
      </div>

      <div className="mt-4 flex h-8 items-end justify-between gap-0.5" aria-hidden>
        {bars.map((height, index) => (
          <span
            key={index}
            className="w-1 origin-bottom rounded-full bg-[#5b4dff]/70"
            style={{
              height: `${height}px`,
              opacity: active ? 1 : 0.45,
              animation: active ? `ai-voice-bar 1.1s ease-in-out ${(index % 6) * 0.08}s infinite` : undefined,
            }}
          />
        ))}
      </div>

      <button
        type="button"
        aria-label={`Seek ${title} sample`}
        onClick={(event) => seek(event.clientX, event.currentTarget)}
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#efeefe]"
      >
        <span className="block h-full rounded-full bg-[#5b4dff]" style={{ width: `${progress}%` }} />
      </button>
      <p className="mt-2 text-xs tabular-nums text-[#667085]">
        {formatTime(current)} / {formatTime(duration)}
      </p>

      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        data-sample-call=""
        onEnded={(event) => {
          event.currentTarget.currentTime = 0;
          setCurrent(0);
          if (active) onActivate();
        }}
      />
    </article>
  );
}

function barsFor(title: string) {
  return Array.from({ length: 22 }, (_, index) => {
    const seed = title.charCodeAt(index % title.length) + index * 13;
    return 8 + (seed % 22);
  });
}

export function SampleCallPlayers() {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  return (
    <div className="mt-10">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#667085]">
        Hear a sample screen
      </p>
      <style>{`
        @keyframes ai-voice-bar {
          0%, 100% { transform: scaleY(0.45); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_CALLS.map((sample) => (
          <SampleCallCard
            key={sample.title}
            title={sample.title}
            src={sample.src}
            bars={barsFor(sample.title)}
            active={activeTitle === sample.title}
            onActivate={() =>
              setActiveTitle((current) => (current === sample.title ? null : sample.title))
            }
          />
        ))}
      </div>
    </div>
  );
}
