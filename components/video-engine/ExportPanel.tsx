"use client";

export function ExportPanel({ loading, progress, output, onExport, onCancel }: { loading: boolean; progress: number; output: string; onExport: () => void; onCancel: () => void }) {
  return (
    <div className="card p-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
      <div className="min-w-0">
        <p className="font-bold text-sm">Exportação local</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-4)" }}>
          {loading ? `Processando ${progress}%` : "Gera MP4 final no navegador. Vídeo não sobe para servidor."}
        </p>
        {loading && <div className="h-2 mt-3 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}><div className="h-full rounded-full" style={{ width: `${Math.max(4, progress)}%`, background: "var(--blue)" }} /></div>}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {loading ? <button className="btn-secondary" onClick={onCancel}>Cancelar</button> : <button className="btn-primary" onClick={onExport}>Exportar MP4</button>}
        {output && <a className="btn-secondary" href={output} download="trackfy-criativo.mp4">Baixar MP4</a>}
      </div>
    </div>
  );
}
