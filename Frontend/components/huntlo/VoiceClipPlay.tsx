"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Waveform } from "./primitives";

type VoiceClipPlayProps = {
  src: string;
  label: string;
  className?: string;
  buttonClassName?: string;
  children?: ReactNode | ((playing: boolean) => ReactNode);
  /** Place the play control before children/waveform (outreach card) instead of after. */
  buttonFirst?: boolean;
  withWaveform?: boolean;
  waveformBars?: number;
};

export function VoiceClipPlay({
  src,
  label,
  className,
  buttonClassName,
  children,
  buttonFirst = false,
  withWaveform = false,
  waveformBars = 22,
}: VoiceClipPlayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const clipId = useId();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    document.querySelectorAll<HTMLAudioElement>("audio[data-voice-clip]").forEach((node) => {
      if (node !== audio) node.pause();
    });
    void audio.play().catch(() => undefined);
  }

  const button = (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? `Pause ${label}` : `Play ${label}`}
      className={cn(
        "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90",
        buttonClassName,
      )}
    >
      {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
    </button>
  );

  const content = typeof children === "function" ? children(playing) : children;

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-3", className)}>
      <audio ref={audioRef} src={src} preload="none" data-voice-clip={clipId} />
      {buttonFirst ? button : null}
      {content}
      {withWaveform ? <Waveform bars={waveformBars} active={playing} className="min-w-0 flex-1 overflow-hidden" /> : null}
      {buttonFirst ? null : button}
    </div>
  );
}
