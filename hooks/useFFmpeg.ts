"use client";
import { useCallback, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import type { VideoAsset, VideoProject } from "@/lib/video/types";
import { trimArgs } from "@/lib/video/ffmpegCommands";

export function useFFmpeg() {
  const instance = useRef<FFmpeg | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (instance.current?.loaded) return instance.current;
    setLoading(true);
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: value }) => setProgress(Math.max(0, Math.min(100, Math.round(value * 100)))));
    const base = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
    await ffmpeg.load({ coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"), wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm") });
    instance.current = ffmpeg; setLoading(false); return ffmpeg;
  }, []);

  const cancel = useCallback(() => { instance.current?.terminate(); instance.current = null; setLoading(false); setProgress(0); }, []);

  const exportProject = useCallback(async (project: VideoProject, assets: VideoAsset[]) => {
    if (!project.clips.length) throw new Error("Adicione pelo menos um corte.");
    setLoading(true); setProgress(0);
    const ffmpeg = await load(); const parts: string[] = [];
    try {
      for (let i = 0; i < project.clips.length; i++) {
        const clip = project.clips[i]; const asset = assets.find((item) => item.id === clip.assetId);
        if (!asset) throw new Error(`Arquivo do corte “${clip.name}” não está disponível. Envie-o novamente.`);
        const input = `input-${i}.${asset.name.split(".").pop() || "mp4"}`; const output = `part-${i}.mp4`;
        await ffmpeg.writeFile(input, await fetchFile(asset.file));
        await ffmpeg.exec(trimArgs(input, output, clip.start, clip.end, project.ratio, project.fit)); parts.push(output);
        await ffmpeg.deleteFile(input);
      }
      await ffmpeg.writeFile("concat.txt", new TextEncoder().encode(parts.map((part) => `file '${part}'`).join("\n")));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
      return URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
    } finally {
      for (const file of [...parts, "concat.txt", "output.mp4"]) { try { await ffmpeg.deleteFile(file); } catch { /* arquivo opcional */ } }
      setLoading(false);
    }
  }, [load]);
  return { load, exportProject, cancel, loading, progress };
}
