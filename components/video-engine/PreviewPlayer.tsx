"use client";
import type { VideoAsset, VideoClip } from "@/lib/video/types";

export function PreviewPlayer({ clip, asset, onTime }: { clip?: VideoClip; asset?: VideoAsset; onTime: (time: number) => void }) {
  if (!clip || !asset) return <div className="card aspect-video grid place-items-center text-sm" style={{ color: "var(--text-4)" }}>Selecione um corte na timeline</div>;
  return <div className="card p-3"><video key={asset.url} src={asset.url} controls className="w-full max-h-[52vh] bg-black rounded-xl" onLoadedMetadata={(e) => { e.currentTarget.currentTime = clip.start; }} onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)} /></div>;
}
