"use client";
import type { VideoClip } from "@/lib/video/types";

export function Timeline({ clips, selectedId, onSelect, onMove, onDelete, onDuplicate }: { clips: VideoClip[]; selectedId: string; onSelect: (id: string) => void; onMove: (index: number, direction: -1 | 1) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void }) {
  return <section className="card p-4 overflow-hidden"><div className="flex justify-between mb-3"><h2 className="font-bold text-sm">Timeline</h2><span className="text-xs" style={{ color: "var(--text-4)" }}>{clips.reduce((sum, c) => sum + c.end - c.start, 0).toFixed(1)}s</span></div>
    <div className="flex gap-2 overflow-x-auto pb-2 min-h-24">{clips.map((clip, index) => <div key={clip.id} onClick={() => onSelect(clip.id)} className="shrink-0 w-48 p-3 rounded-xl border cursor-pointer" style={{ borderColor: selectedId === clip.id ? "var(--blue)" : "var(--border)", background: selectedId === clip.id ? "var(--blue-muted)" : "var(--surface-2)" }}>
      <p className="text-xs font-bold truncate">{clip.name}</p><p className="text-[11px] mt-1">{clip.start.toFixed(1)}s → {clip.end.toFixed(1)}s</p>
      <div className="flex gap-1 mt-2"><button className="btn-icon" disabled={!index} onClick={(e) => { e.stopPropagation(); onMove(index, -1); }}>←</button><button className="btn-icon" disabled={index === clips.length - 1} onClick={(e) => { e.stopPropagation(); onMove(index, 1); }}>→</button><button className="btn-icon" onClick={(e) => { e.stopPropagation(); onDuplicate(clip.id); }}>⧉</button><button className="btn-icon" onClick={(e) => { e.stopPropagation(); onDelete(clip.id); }}>×</button></div>
    </div>)}</div></section>;
}
