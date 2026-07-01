import type { AspectRatio, EditStyle, FitMode } from "./types";

const dimensions: Record<AspectRatio, [number, number]> = {
  "9:16": [720, 1280],
  "1:1": [720, 720],
  "16:9": [1280, 720],
};

function styleFilter(style: EditStyle, punchZoom: boolean, duration: number) {
  const filters: string[] = [];
  if (punchZoom) filters.push("scale=iw*1.055:ih*1.055,crop=iw/1.055:ih/1.055");
  if (style === "capcut") filters.push("eq=contrast=1.13:saturation=1.28:brightness=0.018", "unsharp=5:5:0.75:3:3:0.35");
  if (style === "ads") filters.push("eq=contrast=1.1:saturation=1.38:brightness=0.02", "unsharp=7:7:0.85:3:3:0.4");
  if (style === "cinematic") filters.push("eq=contrast=1.08:saturation=0.92:brightness=-0.015", "vignette=PI/5", "unsharp=5:5:0.45:3:3:0.2");
  if (duration > 0.5) {
    const outStart = Math.max(0, duration - 0.16);
    filters.push(`fade=t=in:st=0:d=0.10`, `fade=t=out:st=${outStart.toFixed(3)}:d=0.14`);
  }
  return filters;
}

export function videoFilter(ratio: AspectRatio, fit: FitMode, style: EditStyle = "clean", punchZoom = false, duration = 0) {
  const [w, h] = dimensions[ratio];
  const base = fit === "cover"
    ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1,format=yuv420p`
    : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p`;
  const filters = [base.replace(",format=yuv420p", ""), ...styleFilter(style, punchZoom, duration), "format=yuv420p"];
  return filters.join(",");
}

export function trimArgs(input: string, output: string, start: number, end: number, ratio: AspectRatio, fit: FitMode, style: EditStyle = "clean", punchZoom = false) {
  if (start < 0 || end <= start) throw new Error("Intervalo de corte inválido.");
  const duration = end - start;
  return [
    "-y",
    "-ss", start.toFixed(3),
    "-i", input,
    "-t", duration.toFixed(3),
    "-map", "0:v:0",
    "-map", "0:a?",
    "-vf", videoFilter(ratio, fit, style, punchZoom, duration),
    "-r", "30",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-avoid_negative_ts", "make_zero",
    output,
  ];
}
