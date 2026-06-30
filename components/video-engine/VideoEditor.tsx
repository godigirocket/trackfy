"use client";
import { useEffect, useMemo, useState } from "react";
import { MediaLibrary } from "./MediaLibrary";
import { PreviewPlayer } from "./PreviewPlayer";
import { Timeline } from "./Timeline";
import { Inspector } from "./Inspector";
import { ExportPanel } from "./ExportPanel";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { loadProject, saveProject } from "@/lib/video/indexedDb";
import type { VideoAsset, VideoClip, VideoProject } from "@/lib/video/types";

const initial: VideoProject = { id: "default", name: "Meu projeto", clips: [], ratio: "9:16", fit: "cover", hook: "", cta: "", updatedAt: new Date().toISOString() };

function inspect(file: File): Promise<VideoAsset> {
  return new Promise((resolve, reject) => { const url = URL.createObjectURL(file); const video = document.createElement("video"); video.preload = "metadata"; video.src = url;
    video.onloadedmetadata = () => resolve({ id: crypto.randomUUID(), name: file.name, file, url, duration: video.duration });
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`Não foi possível ler ${file.name}.`)); }; });
}

export function VideoEditor() {
  const [project, setProject] = useState(initial); const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [selectedId, setSelectedId] = useState(""); const [cursor, setCursor] = useState(0); const [output, setOutput] = useState(""); const [error, setError] = useState("");
  const { exportProject, cancel, loading, progress } = useFFmpeg();
  const clip = project.clips.find((item) => item.id === selectedId); const asset = assets.find((item) => item.id === clip?.assetId);

  useEffect(() => { loadProject().then((saved) => saved && setProject(saved)).catch(() => setError("Não foi possível recuperar o projeto salvo.")); }, []);
  useEffect(() => { const timer = window.setTimeout(() => void saveProject({ ...project, updatedAt: new Date().toISOString() }), 400); return () => clearTimeout(timer); }, [project]);
  const upload = async (list: FileList) => { setError(""); try { const files = Array.from(list); if (files.some((file) => file.size > 500 * 1024 * 1024)) throw new Error("No navegador, use vídeos menores que 500 MB."); const inspected = await Promise.all(files.map(inspect)); setAssets((current) => [...current, ...inspected]); setProject((p) => ({ ...p, clips: p.clips.map((clip) => { const match = inspected.find((item) => item.name === clip.name.replace(/ \(parte 2\)| \(cópia\)/g, "")); return match ? { ...clip, assetId: match.id } : clip; }) })); } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha no upload."); } };
  const add = (item: VideoAsset) => { const next: VideoClip = { id: crypto.randomUUID(), assetId: item.id, name: item.name, start: 0, end: item.duration }; setProject((p) => ({ ...p, clips: [...p.clips, next] })); setSelectedId(next.id); };
  const patchClip = (patch: Partial<VideoClip>) => setProject((p) => ({ ...p, clips: p.clips.map((c) => c.id === selectedId ? { ...c, ...patch } : c) }));
  const split = () => { if (!clip || cursor <= clip.start || cursor >= clip.end) return; const second = { ...clip, id: crypto.randomUUID(), name: `${clip.name} (parte 2)`, start: cursor }; setProject((p) => { const index = p.clips.findIndex((c) => c.id === clip.id); const clips = [...p.clips]; clips.splice(index, 1, { ...clip, end: cursor }, second); return { ...p, clips }; }); setSelectedId(second.id); };
  const move = (index: number, direction: -1 | 1) => setProject((p) => { const clips = [...p.clips]; [clips[index], clips[index + direction]] = [clips[index + direction], clips[index]]; return { ...p, clips }; });
  const duplicate = (id: string) => setProject((p) => { const index = p.clips.findIndex((c) => c.id === id); const clips = [...p.clips]; clips.splice(index + 1, 0, { ...clips[index], id: crypto.randomUUID(), name: `${clips[index].name} (cópia)` }); return { ...p, clips }; });
  const remove = (id: string) => { setProject((p) => ({ ...p, clips: p.clips.filter((c) => c.id !== id) })); if (selectedId === id) setSelectedId(""); };
  const runExport = async () => { setError(""); try { if (clip && (clip.start < 0 || clip.end <= clip.start || (asset && clip.end > asset.duration))) throw new Error("Corrija o intervalo do corte selecionado."); const url = await exportProject(project, assets); if (output) URL.revokeObjectURL(output); setOutput(url); } catch (cause) { setError(cause instanceof Error ? cause.message : "A exportação falhou."); } };
  const missing = useMemo(() => project.clips.some((c) => !assets.some((a) => a.id === c.assetId)), [project.clips, assets]);

  return <div className="max-w-[1500px] mx-auto space-y-4">
    <div><h1 className="text-2xl font-bold">Video Engine</h1><p className="text-sm mt-1" style={{ color: "var(--text-4)" }}>Editor real com FFmpeg.wasm. Seus arquivos são processados neste dispositivo.</p></div>
    {error && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>{error}</div>}
    {missing && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--yellow-light)", color: "var(--yellow)" }}>Projeto recuperado. Reenvie os arquivos originais para exportar; Blob URLs não são persistidos.</div>}
    <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-4"><MediaLibrary assets={assets} onUpload={upload} onAdd={add} /><PreviewPlayer clip={clip} asset={asset} onTime={setCursor} /><Inspector project={project} clip={clip} cursor={cursor} onProject={(patch) => setProject((p) => ({ ...p, ...patch }))} onClip={patchClip} onSplit={split} /></div>
    <Timeline clips={project.clips} selectedId={selectedId} onSelect={setSelectedId} onMove={move} onDelete={remove} onDuplicate={duplicate} />
    <ExportPanel loading={loading} progress={progress} output={output} onExport={runExport} onCancel={cancel} />
  </div>;
}
