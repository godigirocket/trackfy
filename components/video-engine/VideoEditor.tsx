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
import type { AspectRatio, EditStyle, VideoAsset, VideoClip, VideoProject } from "@/lib/video/types";

const initial: VideoProject = {
  id: "default",
  name: "Meu projeto",
  clips: [],
  ratio: "9:16",
  fit: "cover",
  style: "capcut",
  punchZoom: true,
  hook: "",
  cta: "",
  accent: "#22c55e",
  updatedAt: new Date().toISOString(),
};

type BatchOutput = {
  name: string;
  url: string;
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

function clipWindow(asset: VideoAsset, startRatio: number, seconds: number): Pick<VideoClip, "start" | "end"> {
  const duration = Math.max(0.1, asset.duration || seconds);
  const clipDuration = Math.min(seconds, duration);
  const maxStart = Math.max(0, duration - clipDuration);
  const start = Math.min(maxStart, Math.max(0, maxStart * startRatio));
  return { start, end: start + clipDuration };
}

function buildVariationProject(
  asset: VideoAsset,
  index: number,
  config: {
    name: string;
    ratio: AspectRatio;
    style: EditStyle;
    seconds: number;
    startRatio: number;
    speed: number;
    hook: string;
    cta: string;
    accent: string;
    scenes?: number;
    muted?: boolean;
  },
): VideoProject {
  const sceneCount = config.scenes ?? 1;
  const sceneDuration = Math.max(1.2, config.seconds / sceneCount);
  const clips = Array.from({ length: sceneCount }, (_, sceneIndex) => {
    const ratioStep = sceneCount === 1 ? 0 : sceneIndex / Math.max(1, sceneCount - 1);
    const window = clipWindow(asset, Math.min(0.92, config.startRatio + ratioStep * 0.28), sceneDuration);
    return {
      id: crypto.randomUUID(),
      assetId: asset.id,
      name: `${asset.name} - ${config.name} ${sceneIndex + 1}`,
      start: window.start,
      end: window.end,
      speed: config.speed,
      muted: config.muted ?? config.speed !== 1,
    };
  });

  return {
    ...initial,
    id: crypto.randomUUID(),
    name: `${String(index + 1).padStart(2, "0")} - ${config.name}`,
    ratio: config.ratio,
    fit: "cover",
    style: config.style,
    punchZoom: true,
    hook: config.hook,
    cta: config.cta,
    accent: config.accent,
    clips,
    updatedAt: new Date().toISOString(),
  };
}

function buildSixVariationProjects(asset: VideoAsset): VideoProject[] {
  const variations = [
    { name: "Hook rapido vertical", ratio: "9:16" as const, style: "ads" as const, seconds: 6, startRatio: 0, speed: 1.15, scenes: 3, hook: "PARE DE PERDER DINHEIRO", cta: "VEJA AGORA", accent: "#22c55e" },
    { name: "Oferta direta", ratio: "9:16" as const, style: "capcut" as const, seconds: 8, startRatio: 0.14, speed: 1, scenes: 2, hook: "ISSO MUDA O JOGO", cta: "TESTE HOJE", accent: "#3b82f6" },
    { name: "Prova social", ratio: "9:16" as const, style: "cinematic" as const, seconds: 10, startRatio: 0.3, speed: 1, scenes: 2, hook: "RESULTADO REAL", cta: "CONFIRA", accent: "#f59e0b" },
    { name: "Feed quadrado", ratio: "1:1" as const, style: "ads" as const, seconds: 12, startRatio: 0.44, speed: 1.2, scenes: 3, hook: "CRIATIVO PARA FEED", cta: "CLIQUE E SAIBA MAIS", accent: "#ef4444" },
    { name: "Reels 15 segundos", ratio: "9:16" as const, style: "capcut" as const, seconds: 15, startRatio: 0.58, speed: 1.05, scenes: 3, hook: "ANTES DE COMPRAR, VEJA ISSO", cta: "APROVEITE", accent: "#a855f7" },
    { name: "Versao wide", ratio: "16:9" as const, style: "clean" as const, seconds: 18, startRatio: 0.72, speed: 1, scenes: 2, hook: "VERSAO COMPLETA", cta: "COMECE AGORA", accent: "#06b6d4" },
  ];
  return variations.map((config, index) => buildVariationProject(asset, index, config));
}

export function VideoEditor() {
  const [project, setProject] = useState<VideoProject>(initial);
  const [assets, setAssets] = useState<VideoAsset[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [cursor, setCursor] = useState(0);
  const [output, setOutput] = useState("");
  const [batchOutputs, setBatchOutputs] = useState<BatchOutput[]>([]);
  const [error, setError] = useState("");
  const [autoBusy, setAutoBusy] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
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

  const autoCapCut = async () => {
    setError("");
    if (!assets.length) { setError("Envie pelo menos um vídeo para o auto editor montar os criativos."); return; }
    setAutoBusy(true);
    try {
      const generated = (await Promise.all(assets.map((item) => autoCutByAudio(item, { threshold: 0.028, minSilence: 0.35, padding: 0.12, minClip: 0.55 })))).flat();
      const bestCuts = generated
        .sort((a, b) => (b.end - b.start) - (a.end - a.start))
        .slice(0, 12)
        .sort((a, b) => a.start - b.start);
      setProject((current) => ({
        ...current,
        ratio: "9:16",
        fit: "cover",
        style: "capcut",
        punchZoom: true,
        clips: bestCuts.length ? bestCuts : assets.flatMap((item) => splitIntoShorts(item, 8)),
      }));
      setSelectedId((bestCuts[0] ?? generated[0])?.id ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível montar a edição automática.");
    } finally {
      setAutoBusy(false);
    }
  };

  const makeShorts = () => {
    setError("");
    if (!assets.length) { setError("Envie pelo menos um vídeo para criar shorts."); return; }
    const generated = assets.flatMap((item) => splitIntoShorts(item, 12));
    setProject((current) => ({ ...current, ratio: "9:16", fit: "cover", style: "ads", punchZoom: true, clips: generated }));
    setSelectedId(generated[0]?.id ?? "");
  };

  const makeTimedCuts = (seconds: number, style: "ads" | "capcut" = "ads") => {
    setError("");
    if (!assets.length) { setError("Envie pelo menos um vídeo para criar variações."); return; }
    const generated = assets.flatMap((item) => splitIntoShorts(item, seconds)).slice(0, 20);
    setProject((current) => ({ ...current, ratio: "9:16", fit: "cover", style, punchZoom: true, clips: generated }));
    setSelectedId(generated[0]?.id ?? "");
  };

  const makeSpeedVariations = () => {
    setError("");
    const base = project.clips.length ? project.clips : assets.flatMap((item) => splitIntoShorts(item, 8)).slice(0, 6);
    if (!base.length) { setError("Envie um vídeo ou crie cortes antes de gerar variações."); return; }
    const speeds = [1, 1.15, 1.3];
    const generated = speeds.flatMap((speed) => base.slice(0, 4).map((clip) => ({ ...clip, id: crypto.randomUUID(), name: `${clip.name} · ${speed}x`, speed })));
    setProject((current) => ({ ...current, ratio: "9:16", fit: "cover", style: "ads", punchZoom: true, clips: generated }));
    setSelectedId(generated[0]?.id ?? "");
  };

  const exportSixVariations = async () => {
    setError("");
    if (!assets.length) {
      setError("Envie 1 vídeo para gerar 6 variações em massa.");
      return;
    }
    setBatchBusy(true);
    batchOutputs.forEach((item) => URL.revokeObjectURL(item.url));
    setBatchOutputs([]);
    try {
      const source = assets[0];
      const variations = buildSixVariationProjects(source);
      const outputs: BatchOutput[] = [];
      setProject(variations[0]);
      setSelectedId(variations[0].clips[0]?.id ?? "");

      for (const variation of variations) {
        const url = await exportProject(variation, assets);
        outputs.push({ name: `${variation.name}.mp4`, url });
        setBatchOutputs([...outputs]);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Falha ao exportar as variações em massa.");
    } finally {
      setBatchBusy(false);
    }
  };

  const clearTimeline = () => {
    setProject((current) => ({ ...current, clips: [] }));
    setSelectedId("");
    if (output) URL.revokeObjectURL(output);
    setOutput("");
    batchOutputs.forEach((item) => URL.revokeObjectURL(item.url));
    setBatchOutputs([]);
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
        <button type="button" onClick={autoCapCut} disabled={autoBusy || loading} className="video-action-card video-action-card--primary">
          <strong>{autoBusy ? "Montando criativo..." : "Auto editar estilo CapCut"}</strong>
          <span>Corta silêncios, monta ritmo vertical e aplica look de criativo.</span>
        </button>
        <button type="button" onClick={autoCut} disabled={autoBusy || loading} className="video-action-card">
          <strong>{autoBusy ? "Analisando áudio..." : "Auto cortar silêncios"}</strong>
          <span>Remove partes paradas e monta a timeline automaticamente.</span>
        </button>
        <button type="button" onClick={makeShorts} disabled={loading} className="video-action-card">
          <strong>Criar shorts de 12s</strong>
          <span>Divide os vídeos em vários criativos curtos para testar.</span>
        </button>
        <button type="button" onClick={() => makeTimedCuts(6, "ads")} disabled={loading} className="video-action-card">
          <strong>Criativos rápidos 6s</strong>
          <span>Gera variações curtas para anúncios diretos e testes A/B.</span>
        </button>
        <button type="button" onClick={() => makeTimedCuts(15, "capcut")} disabled={loading} className="video-action-card">
          <strong>Criativos 15s</strong>
          <span>Monta cortes maiores para Reels, TikTok e stories.</span>
        </button>
        <button type="button" onClick={makeSpeedVariations} disabled={loading || batchBusy} className="video-action-card">
          <strong>Gerar variações</strong>
          <span>Duplica cortes com ritmos diferentes para testar criativos.</span>
        </button>
        <button type="button" onClick={exportSixVariations} disabled={loading || autoBusy || batchBusy} className="video-action-card video-action-card--primary">
          <strong>{batchBusy ? "Exportando pacote..." : "Exportar 6 variações"}</strong>
          <span>Sobe 1 vídeo e baixa 6 MP4s prontos: hooks, oferta, feed e wide.</span>
        </button>
        <button type="button" onClick={() => setProject((current) => ({ ...current, ratio: current.ratio === "9:16" ? "1:1" : current.ratio === "1:1" ? "16:9" : "9:16" }))} disabled={loading} className="video-action-card">
          <strong>Trocar formato</strong>
          <span>Alterna 9:16, 1:1 e 16:9 para redes diferentes.</span>
        </button>
        <button type="button" onClick={() => setProject((current) => ({ ...current, style: current.style === "capcut" ? "ads" : current.style === "ads" ? "cinematic" : current.style === "cinematic" ? "clean" : "capcut", punchZoom: true }))} disabled={loading} className="video-action-card">
          <strong>Trocar look</strong>
          <span>Atual: {project.style ?? "clean"}. Aplica cor, nitidez e punch no export.</span>
        </button>
        <button type="button" onClick={clearTimeline} disabled={loading || !project.clips.length} className="video-action-card video-action-card--danger">
          <strong>Limpar timeline</strong>
          <span>Recomeça os cortes sem apagar os vídeos enviados.</span>
        </button>
      </div>

      {(batchBusy || batchOutputs.length > 0) && (
        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Pacote de criativos</h2>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {batchBusy ? `Exportando ${batchOutputs.length}/6 arquivos. Mantenha esta aba aberta.` : "Arquivos prontos para baixar."}
              </p>
            </div>
            <span className="badge badge-blue">{batchOutputs.length}/6 MP4</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {batchOutputs.map((item) => (
              <a key={item.name} href={item.url} download={item.name} className="btn-secondary text-center">
                Baixar {item.name}
              </a>
            ))}
          </div>
        </div>
      )}

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
