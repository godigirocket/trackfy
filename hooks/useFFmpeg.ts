"use client";

import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { VideoAsset, VideoProject } from "@/lib/video/types";
import { trimArgs } from "@/lib/video/ffmpegCommands";

function safeExt(name: string) {
  return (name.split(".").pop() || "mp4").replace(/[^a-z0-9]/gi, "").toLowerCase() || "mp4";
}

export function useFFmpeg() {
  const instance = useRef<FFmpeg | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Pronto para carregar o motor de corte.");

  const load = useCallback(async () => {
    if (instance.current?.loaded) return instance.current;
    setLoading(true);
    setStatus("Carregando motor de corte no navegador...");
    try {
      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress: value }) => {
        setProgress(Math.max(0, Math.min(100, Math.round(value * 100))));
      });
      ffmpeg.on("log", ({ message }) => {
        if (/error|failed|invalid/i.test(message)) setStatus(message.slice(0, 160));
      });

      const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
      });
      instance.current = ffmpeg;
      setStatus("Motor carregado. Pronto para exportar cortes.");
      return ffmpeg;
    } catch (error) {
      setStatus("Não foi possível carregar o motor de vídeo.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    instance.current?.terminate();
    instance.current = null;
    setLoading(false);
    setProgress(0);
    setStatus("Exportação cancelada.");
  }, []);

  const exportProject = useCallback(async (project: VideoProject, assets: VideoAsset[]) => {
    if (!project.clips.length) throw new Error("Adicione pelo menos um corte na timeline.");
    setLoading(true);
    setProgress(0);
    const ffmpeg = await load();
    const parts: string[] = [];

    try {
      for (let i = 0; i < project.clips.length; i++) {
        const clip = project.clips[i];
        const asset = assets.find((item) => item.id === clip.assetId);
        if (!asset) throw new Error(`Reenvie o arquivo original do corte "${clip.name}".`);
        if (clip.start < 0 || clip.end <= clip.start || clip.end > asset.duration + 0.05) {
          throw new Error(`Corrija o intervalo do corte "${clip.name}".`);
        }

        setStatus(`Cortando ${i + 1}/${project.clips.length}: ${clip.name}`);
        const input = `input-${i}.${safeExt(asset.name)}`;
        const output = `part-${i}.mp4`;
        await ffmpeg.writeFile(input, await fetchFile(asset.file));
        await ffmpeg.exec(trimArgs(input, output, clip.start, clip.end, project.ratio, project.fit, project.style ?? "clean", Boolean(project.punchZoom)));
        await ffmpeg.deleteFile(input);
        parts.push(output);
      }

      setStatus("Unindo cortes em um MP4 final...");
      if (parts.length === 1) {
        const data = await ffmpeg.readFile(parts[0]);
        const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
        return URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
      }

      await ffmpeg.writeFile("concat.txt", new TextEncoder().encode(parts.map((part) => `file '${part}'`).join("\n")));
      await ffmpeg.exec([
        "-f", "concat",
        "-safe", "0",
        "-i", "concat.txt",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "23",
        "-c:a", "aac",
        "-movflags", "+faststart",
        "output.mp4",
      ]);
      const data = await ffmpeg.readFile("output.mp4");
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
      setStatus("Vídeo exportado com sucesso.");
      return URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
    } finally {
      for (const file of [...parts, "concat.txt", "output.mp4"]) {
        try { await ffmpeg.deleteFile(file); } catch { /* opcional */ }
      }
      setLoading(false);
    }
  }, [load]);

  return { load, exportProject, cancel, loading, progress, status };
}
