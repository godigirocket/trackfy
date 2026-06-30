"use client";
import type { VideoAsset } from "@/lib/video/types";

export function MediaLibrary({ assets, onUpload, onAdd }: { assets: VideoAsset[]; onUpload: (files: FileList) => void; onAdd: (asset: VideoAsset) => void }) {
  return <aside className="card p-4 min-w-0">
    <h2 className="font-bold text-sm mb-3">Mídia</h2>
    <label className="btn-primary flex justify-center cursor-pointer py-2.5 text-sm">Enviar vídeos
      <input className="hidden" type="file" accept="video/*" multiple onChange={(e) => e.target.files && onUpload(e.target.files)} />
    </label>
    <div className="mt-4 space-y-2 max-h-72 overflow-auto">
      {assets.map((asset) => <button key={asset.id} onClick={() => onAdd(asset)} className="w-full text-left p-2 rounded-lg border" style={{ borderColor: "var(--border)" }}>
        <span className="block text-xs font-semibold truncate">{asset.name}</span><span className="text-[11px]" style={{ color: "var(--text-4)" }}>{asset.duration.toFixed(1)}s · clique para adicionar</span>
      </button>)}
      {!assets.length && <p className="text-xs text-center py-8" style={{ color: "var(--text-4)" }}>Nenhum arquivo. O vídeo fica no seu dispositivo.</p>}
    </div>
  </aside>;
}
