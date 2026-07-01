"use client";

import type { VideoClip } from "@/lib/video/types";

export function Timeline({ clips, selectedId, onSelect, onMove, onDelete, onDuplicate }: { clips: VideoClip[]; selectedId: string; onSelect: (id: string) => void; onMove: (index: number, direction: -1 | 1) => void; onDelete: (id: string) => void; onDuplicate: (id: string) => void }) {
  const total = clips.reduce((sum, clip) => sum + Math.max(0, (clip.end - clip.start) / (clip.speed ?? 1)), 0);

  return (
    <section className="card p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="font-bold text-sm">Timeline de criativos</h2>
          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>Reordene, duplique, acelere e exclua cortes antes de exportar.</p>
        </div>
        <span className="badge badge-blue">{total.toFixed(1)}s final</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 min-h-28">
        {clips.map((clip, index) => (
          <div key={clip.id} onClick={() => onSelect(clip.id)} className="shrink-0 w-56 p-3 rounded-xl border cursor-pointer" style={{ borderColor: selectedId === clip.id ? "var(--blue)" : "var(--border)", background: selectedId === clip.id ? "var(--blue-muted)" : "var(--surface-2)" }}>
            <p className="text-xs font-bold truncate">{clip.name}</p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>{clip.start.toFixed(1)}s → {clip.end.toFixed(1)}s</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="badge badge-neutral">{clip.speed ?? 1}x</span>
              {clip.muted && <span className="badge badge-yellow">mudo</span>}
            </div>
            <div className="flex gap-1 mt-3">
              <button className="btn-icon" disabled={!index} onClick={(event) => { event.stopPropagation(); onMove(index, -1); }}>←</button>
              <button className="btn-icon" disabled={index === clips.length - 1} onClick={(event) => { event.stopPropagation(); onMove(index, 1); }}>→</button>
              <button className="btn-icon" onClick={(event) => { event.stopPropagation(); onDuplicate(clip.id); }}>⧉</button>
              <button className="btn-icon" onClick={(event) => { event.stopPropagation(); onDelete(clip.id); }}>×</button>
            </div>
          </div>
        ))}
        {!clips.length && <div className="w-full rounded-xl p-8 text-center" style={{ background: "var(--bg-subtle)", color: "var(--text-4)" }}>Envie vídeos e clique em “Auto editar estilo CapCut” para montar a timeline.</div>}
      </div>
    </section>
  );
}
