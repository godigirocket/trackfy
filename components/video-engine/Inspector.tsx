"use client";
import type { VideoClip, VideoProject } from "@/lib/video/types";

export function Inspector({ project, clip, cursor, onProject, onClip, onSplit }: { project: VideoProject; clip?: VideoClip; cursor: number; onProject: (patch: Partial<VideoProject>) => void; onClip: (patch: Partial<VideoClip>) => void; onSplit: () => void }) {
  return <aside className="card p-4 space-y-4 min-w-0"><h2 className="font-bold text-sm">Propriedades</h2>
    <div><label className="section-label">Formato</label><select className="select mt-1" value={project.ratio} onChange={(e) => onProject({ ratio: e.target.value as VideoProject["ratio"] })}><option>9:16</option><option>1:1</option><option>16:9</option></select></div>
    <div><label className="section-label">Enquadramento</label><select className="select mt-1" value={project.fit} onChange={(e) => onProject({ fit: e.target.value as VideoProject["fit"] })}><option value="cover">Preencher/crop</option><option value="contain">Ajustar com fundo</option></select></div>
    {clip ? <><div className="grid grid-cols-2 gap-2"><label className="text-xs">Início<input className="input mt-1" type="number" min={0} step="0.1" value={clip.start} onChange={(e) => onClip({ start: Number(e.target.value) })} /></label><label className="text-xs">Fim<input className="input mt-1" type="number" step="0.1" value={clip.end} onChange={(e) => onClip({ end: Number(e.target.value) })} /></label></div><button className="btn-secondary w-full" onClick={onSplit} disabled={cursor <= clip.start || cursor >= clip.end}>Dividir no cursor ({cursor.toFixed(1)}s)</button></> : <p className="text-xs" style={{ color: "var(--text-4)" }}>Selecione um corte.</p>}
    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-4)" }}>Textos, legendas e música serão habilitados quando puderem ser incluídos no arquivo exportado; não há controles decorativos.</p>
  </aside>;
}
