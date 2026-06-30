import type { VideoAsset, VideoClip } from "./types";

type AutoCutOptions = {
  threshold: number;
  minSilence: number;
  padding: number;
  minClip: number;
};

const defaults: AutoCutOptions = {
  threshold: 0.035,
  minSilence: 0.45,
  padding: 0.18,
  minClip: 0.7,
};

function mergeSegments(segments: Array<{ start: number; end: number }>, gap = 0.18) {
  const merged: Array<{ start: number; end: number }> = [];
  for (const segment of segments) {
    const last = merged.at(-1);
    if (last && segment.start - last.end <= gap) last.end = Math.max(last.end, segment.end);
    else merged.push({ ...segment });
  }
  return merged;
}

export function splitIntoShorts(asset: VideoAsset, seconds = 12): VideoClip[] {
  const clips: VideoClip[] = [];
  for (let start = 0; start < asset.duration; start += seconds) {
    const end = Math.min(asset.duration, start + seconds);
    if (end - start >= 0.5) {
      clips.push({ id: crypto.randomUUID(), assetId: asset.id, name: `${asset.name} · ${clips.length + 1}`, start, end });
    }
  }
  return clips;
}

export async function autoCutByAudio(asset: VideoAsset, options: Partial<AutoCutOptions> = {}): Promise<VideoClip[]> {
  const settings = { ...defaults, ...options };
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return splitIntoShorts(asset, 12);

  try {
    const context = new AudioCtx();
    const buffer = await context.decodeAudioData(await asset.file.arrayBuffer());
    await context.close();
    const sampleRate = buffer.sampleRate;
    const channel = buffer.getChannelData(0);
    const windowSize = Math.max(1, Math.floor(sampleRate * 0.08));
    const silenceWindows = Math.ceil(settings.minSilence / 0.08);
    const raw: Array<{ start: number; end: number }> = [];
    let activeStart: number | null = null;
    let silentCount = 0;

    for (let i = 0; i < channel.length; i += windowSize) {
      let sum = 0;
      const end = Math.min(channel.length, i + windowSize);
      for (let j = i; j < end; j++) sum += Math.abs(channel[j]);
      const avg = sum / Math.max(1, end - i);
      const time = i / sampleRate;

      if (avg >= settings.threshold) {
        if (activeStart === null) activeStart = time;
        silentCount = 0;
      } else if (activeStart !== null) {
        silentCount++;
        if (silentCount >= silenceWindows) {
          const segmentEnd = Math.max(activeStart, time - settings.minSilence);
          raw.push({
            start: Math.max(0, activeStart - settings.padding),
            end: Math.min(asset.duration, segmentEnd + settings.padding),
          });
          activeStart = null;
          silentCount = 0;
        }
      }
    }

    if (activeStart !== null) raw.push({ start: Math.max(0, activeStart - settings.padding), end: asset.duration });
    const segments = mergeSegments(raw).filter((segment) => segment.end - segment.start >= settings.minClip);
    const finalSegments = segments.length ? segments : [{ start: 0, end: asset.duration }];
    return finalSegments.map((segment, index) => ({
      id: crypto.randomUUID(),
      assetId: asset.id,
      name: `${asset.name} · corte ${index + 1}`,
      start: Number(segment.start.toFixed(2)),
      end: Number(segment.end.toFixed(2)),
    }));
  } catch {
    return splitIntoShorts(asset, 12);
  }
}
