"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportPanel } from "./ExportPanel";
import { Inspector } from "./Inspector";
import { MediaLibrary } from "./MediaLibrary";
import { PreviewPlayer } from "./PreviewPlayer";
import { Timeline } from "./Timeline";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { autoCutByAudio, splitIntoShorts } from "@/lib/video/autoCut";
import { loadProject, saveProject } from "@/lib/video/indexedDb";
import type { VideoAsset, VideoClip, VideoProject } from "@/lib/video/types";

const initial: VideoProject = {
  id: "default",
  name: "Meu projeto",
  clips: [],
  ratio: "9:16",
  fit: "cover",
  hook: "",
  cta: "",
  updatedAt: new Date().toISOString(),
};

function inspect(file: File): Promise<VideoAsset> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.onloadedmetadata = () => resolve({ id: crypto.randomUUID(), name: file.name, file, url, duration: video.duration });
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Não foi possível ler ${file.name}.`));
    };
  });
}

export function VideoEditor() {
  const [project, setProject] = useState<VideoProject>(initial);
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [cursor, setCursor] = useState(0);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [autoBusy, setAutoBusy] = useState(false);
  const { load, exportProject, cancel, loading, progress, status } = useFFmpeg();

  const clip = project.clips.find((item) => item.id === selectedId);
  const asset = assets.find((item) => item.id === clip?.assetId);
  const duration = project.clips.reduce((sum, item) => sum + Math.max(0, item.end - item.start), 0);
  const missing = useMemo(() => project.clips.some((item) => !assets.some((assetItem) => assetItem.id === item.assetId)), [project.clips, assets]);

  useEffect(() => {
    loadProject().then((saved) => saved && setProject(saved)).catch(() => setError("Não foi possível recuperar o projeto salvo."));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void saveProject({ ...project, updatedAt: new Date().toISOString() }), 400);
    return () => window.clearTimeout(timer);
  }, [project]);

  const upload = async (list: FileList) => {
    setError("");
    try {
      const files = Array.from(list);
      if (files.some((file) => file.size > 500 * 1024 * 1024)) throw new Error("Use vídeos menores que 500 MB para edição no navegador.");
      const inspected = await Promise.all(files.map(inspect));
      setAssets((current) => [...current, ...inspected]);
      setProject((current) => ({
        ...current,
        clips: current.clips.map((item) => {
          const baseName = item.name.replace(/ \(parte 2\)| \(cópia\)/g, "");
          const match = inspected.find((media) => media.name === baseName);
          return match ? { ...item, assetId: match.id } : item;
        }),
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha no upload.");
    }
  };

  const add = (item: VideoAsset) => {
    const next: VideoClip = { id: crypto.randomUUID(), assetId: item.id, name: item.name, start: 0, end: item.duration };
    setProject((current) => ({ ...current, clips: [...current.clips, next] }));
    setSelectedId(next.id);
  };

  const autoCut = async () => {
    setError("");
    if (!assets.length) { setError("Envie pelo menos um vídeo para gerar cortes automáticos."); return; }
    setAutoBusy(true);
    try {
      const generated = (await Promise.all(assets.map((item) => autoCutByAudio(item)))).flat();
      setProject((current) => ({ ...current, clips: generated }));
      setSelectedId(generated[0]?.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível gerar cortes automáticos.");
    } finally {
      setAutoBusy(false);
    }
  };

  const makeShorts = () => {
    setError("");
    if (!assets.length) { setError("Envie pelo menos um vídeo para criar shorts."); return; }
    const generated = assets.flatMap((item) => splitIntoShorts(item, 12));
    setProject((current) => ({ ...current, clips: generated }));
    setSelectedId(generated[0]?.id ?? "");
  };

  const clearTimeline = () => {
    setProject((current) => ({ ...current, clips: [] }));
    setSelectedId("");
    if (output) URL.revokeObjectURL(output);
    setOutput("");
  };

  const patchClip = (patch: Partial<VideoClip>) => {
    setProject((current) => ({ ...current, clips: current.clips.map((item) => item.id === selectedId ? { ...item, ...patch } : item) }));
  };

  const split = () => {
    if (!clip || cursor <= clip.start || cursor >= clip.end) return;
    const second = { ...clip, id: crypto.randomUUID(), name: `${clip.name} (parte 2)`, start: cursor };
    setProject((current) => {
      const index = current.clips.findIndex((item) => item.id === clip.id);
      const clips = [...current.clips];
      clips.splice(index, 1, { ...clip, end: cursor }, second);
      return { ...current, clips };
    });
    setSelectedId(second.id);
  };

  const move = (index: number, direction: -1 | 1) => {
    setProject((current) => {
      const clips = [...current.clips];
      [clips[index], clips[index + direction]] = [clips[index + direction], clips[index]];
      return { ...current, clips };
    });
  };

  const duplicate = (id: string) => {
    setProject((current) => {
      const index = current.clips.findIndex((item) => item.id === id);
      if (index < 0) return current;
      const clips = [...current.clips];
      clips.splice(index + 1, 0, { ...clips[index], id: crypto.randomUUID(), name: `${clips[index].name} (cópia)` });
      return { ...current, clips };
    });
  };

  const remove = (id: string) => {
    setProject((current) => ({ ...current, clips: current.clips.filter((item) => item.id !== id) }));
    if (selectedId === id) setSelectedId("");
  };

  const runExport = async () => {
    setError("");
    try {
      const url = await exportProject(project, assets);
      if (output) URL.revokeObjectURL(output);
      setOutput(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "A exportação falhou.");
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-4">
      <div className="video-studio-hero">
        <div>
          <p className="video-studio-hero__eyebrow">Cortes locais · MP4</p>
          <h1>Video Engine</h1>
          <p>Corte vídeos, reorganize a timeline e exporte um MP4 final. O processamento roda no navegador; nenhum arquivo é enviado ao servidor.</p>
        </div>
        <button type="button" onClick={() => void load().catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar o motor."))} className="btn-secondary">
          Preparar motor
        </button>
      </div>

      {error && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--red-light)", color: "var(--red)" }}>{error}</div>}
      {missing && <div className="p-3 rounded-xl text-sm" style={{ background: "var(--yellow-light)", color: "var(--yellow)" }}>Projeto recuperado. Reenvie os arquivos originais para exportar.</div>}

      <div className="card p-3 text-[12px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span style={{ color: "var(--text-3)" }}>{status}</span>
        <span className="badge badge-blue">{project.clips.length} corte{project.clips.length === 1 ? "" : "s"} · {duration.toFixed(1)}s</span>
      </div>

      <div className="video-action-grid">
        <button type="button" onClick={autoCut} disabled={autoBusy || loading} className="video-action-card">
          <strong>{autoBusy ? "Analisando áudio..." : "Auto cortar silêncios"}</strong>
          <span>Remove partes paradas e monta a timeline automaticamente.</span>
        </button>
        <button type="button" onClick={makeShorts} disabled={loading} className="video-action-card">
          <strong>Criar shorts de 12s</strong>
          <span>Divide os vídeos em vários criativos curtos para testar.</span>
        </button>
        <button type="button" onClick={() => setProject((current) => ({ ...current, ratio: current.ratio === "9:16" ? "1:1" : current.ratio === "1:1" ? "16:9" : "9:16" }))} disabled={loading} className="video-action-card">
          <strong>Trocar formato</strong>
          <span>Alterna 9:16, 1:1 e 16:9 para redes diferentes.</span>
        </button>
        <button type="button" onClick={clearTimeline} disabled={loading || !project.clips.length} className="video-action-card video-action-card--danger">
          <strong>Limpar timeline</strong>
          <span>Recomeça os cortes sem apagar os vídeos enviados.</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px] gap-4">
        <MediaLibrary assets={assets} onUpload={upload} onAdd={add} />
        <PreviewPlayer clip={clip} asset={asset} onTime={setCursor} />
        <Inspector project={project} clip={clip} cursor={cursor} onProject={(patch) => setProject((current) => ({ ...current, ...patch }))} onClip={patchClip} onSplit={split} />
      </div>

      <Timeline clips={project.clips} selectedId={selectedId} onSelect={setSelectedId} onMove={move} onDelete={remove} onDuplicate={duplicate} />
      <ExportPanel loading={loading} progress={progress} output={output} onExport={runExport} onCancel={cancel} />
    </div>
  );
}
