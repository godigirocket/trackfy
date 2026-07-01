"use client";

import type { EditStyle, VideoClip, VideoProject } from "@/lib/video/types";

const styles: Array<{ value: EditStyle; label: string; description: string }> = [
  { value: "capcut", label: "CapCut clean", description: "mais contraste, nitidez e punch" },
  { value: "ads", label: "Anúncio forte", description: "saturado e chamativo" },
  { value: "cinematic", label: "Cinemático", description: "mais escuro e premium" },
  { value: "clean", label: "Natural", description: "cor original" },
];

export function Inspector({ project, clip, cursor, onProject, onClip, onSplit }: { project: VideoProject; clip?: VideoClip; cursor: number; onProject: (patch: Partial<VideoProject>) => void; onClip: (patch: Partial<VideoClip>) => void; onSplit: () => void }) {
  return (
    <aside className="card p-4 space-y-4 min-w-0">
      <div>
        <h2 className="font-bold text-sm">Edição do criativo</h2>
        <p className="text-[11px] mt-1" style={{ color: "var(--text-4)" }}>Esses efeitos entram no MP4 exportado.</p>
      </div>

      <div>
        <label className="section-label">Formato</label>
        <select className="select mt-1" value={project.ratio} onChange={(e) => onProject({ ratio: e.target.value as VideoProject["ratio"] })}>
          <option value="9:16">9:16 · Reels/TikTok</option>
          <option value="1:1">1:1 · Feed</option>
          <option value="16:9">16:9 · YouTube</option>
        </select>
      </div>

      <div>
        <label className="section-label">Enquadramento</label>
        <select className="select mt-1" value={project.fit} onChange={(e) => onProject({ fit: e.target.value as VideoProject["fit"] })}>
          <option value="cover">Preencher/cortar laterais</option>
          <option value="contain">Ajustar com fundo</option>
        </select>
      </div>

      <div>
        <label className="section-label">Look do vídeo</label>
        <div className="grid gap-2 mt-2">
          {styles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onProject({ style: style.value })}
              className="text-left rounded-xl p-3 border"
              style={{ borderColor: (project.style ?? "clean") === style.value ? "var(--blue)" : "var(--border)", background: (project.style ?? "clean") === style.value ? "var(--blue-muted)" : "var(--surface-2)" }}
            >
              <span className="block text-[12px] font-bold">{style.label}</span>
              <span className="block text-[11px] mt-0.5" style={{ color: "var(--text-4)" }}>{style.description}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>
        <input type="checkbox" checked={Boolean(project.punchZoom)} onChange={(e) => onProject({ punchZoom: e.target.checked })} />
        Punch zoom automático
      </label>

      {clip ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">Início<input className="input mt-1" type="number" min={0} step="0.1" value={clip.start} onChange={(e) => onClip({ start: Number(e.target.value) })} /></label>
            <label className="text-xs">Fim<input className="input mt-1" type="number" step="0.1" value={clip.end} onChange={(e) => onClip({ end: Number(e.target.value) })} /></label>
          </div>
          <div>
            <label className="section-label">Velocidade do corte</label>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => onClip({ speed })}
                  className="rounded-lg px-2 py-2 text-[12px] font-bold"
                  style={{ background: (clip.speed ?? 1) === speed ? "var(--blue-muted)" : "var(--surface-2)", color: (clip.speed ?? 1) === speed ? "var(--blue)" : "var(--text-3)", border: "1px solid var(--border)" }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>
            <input type="checkbox" checked={Boolean(clip.muted)} onChange={(e) => onClip({ muted: e.target.checked })} />
            Mutar áudio deste corte
          </label>
          <button className="btn-secondary w-full" onClick={onSplit} disabled={cursor <= clip.start || cursor >= clip.end}>Dividir no cursor ({cursor.toFixed(1)}s)</button>
        </>
      ) : (
        <p className="text-xs" style={{ color: "var(--text-4)" }}>Selecione um corte para ajustar início/fim.</p>
      )}
    </aside>
  );
}
