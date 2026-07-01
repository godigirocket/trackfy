import type { AspectRatio, EditStyle, FitMode } from "./types";

const dimensions: Record<AspectRatio, [number, number]> = {
  "9:16": [720, 1280],
  "1:1": [720, 720],
  "16:9": [1280, 720],
};

function safeText(value: string, fallback: string) {
  return (value || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\':]/g, "")
    .replace(/[%\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 42);
}

function safeColor(value = "#22c55e") {
  const color = value.trim().replace("#", "");
  return /^[0-9a-f]{6}$/i.test(color) ? `0x${color}` : "0x22c55e";
}

function styleFilter(style: EditStyle, punchZoom: boolean, duration: number) {
  const filters: string[] = [];
  if (punchZoom) filters.push("scale=iw*1.075:ih*1.075,crop=iw/1.075:ih/1.075");
  if (style === "capcut") filters.push("eq=contrast=1.18:saturation=1.35:brightness=0.025", "unsharp=7:7:0.9:3:3:0.45");
  if (style === "ads") filters.push("eq=contrast=1.2:saturation=1.48:brightness=0.03", "unsharp=9:9:1:3:3:0.55");
  if (style === "cinematic") filters.push("eq=contrast=1.14:saturation=0.9:brightness=-0.018", "vignette=PI/5", "unsharp=5:5:0.55:3:3:0.25");
  if (duration > 0.5) {
    const outStart = Math.max(0, duration - 0.16);
    filters.push(`fade=t=in:st=0:d=0.10`, `fade=t=out:st=${outStart.toFixed(3)}:d=0.14`);
  }
  return filters;
}

function creativeOverlays(ratio: AspectRatio, hook: string, cta: string, accent: string) {
  const [w, h] = dimensions[ratio];
  const topSize = ratio === "16:9" ? 42 : ratio === "1:1" ? 38 : 46;
  const bottomSize = ratio === "16:9" ? 32 : ratio === "1:1" ? 30 : 36;
  const topY = ratio === "16:9" ? 38 : 70;
  const bottomY = h - (ratio === "16:9" ? 84 : 118);
  const topText = safeText(hook, "PARE E VEJA ISSO");
  const bottomText = safeText(cta, "CLIQUE AGORA");
  const color = safeColor(accent);

  return [
    `drawbox=x=0:y=0:w=${w}:h=${Math.round(h * 0.15)}:color=black@0.36:t=fill`,
    `drawbox=x=10:y=10:w=${w - 20}:h=${h - 20}:color=${color}@0.92:t=5`,
    `drawtext=text='${topText}':x=(w-text_w)/2:y=${topY}:fontsize=${topSize}:fontcolor=white:box=1:boxcolor=black@0.72:boxborderw=18`,
    `drawbox=x=0:y=${Math.round(h * 0.84)}:w=${w}:h=${Math.round(h * 0.16)}:color=black@0.38:t=fill`,
    `drawtext=text='${bottomText}':x=(w-text_w)/2:y=${bottomY}:fontsize=${bottomSize}:fontcolor=${color}:box=1:boxcolor=black@0.82:boxborderw=14`,
  ];
}

export function videoFilter(ratio: AspectRatio, fit: FitMode, style: EditStyle = "clean", punchZoom = false, duration = 0, hook = "", cta = "", accent = "#22c55e") {
  const [w, h] = dimensions[ratio];
  const base = fit === "cover"
    ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1,format=yuv420p`
    : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,format=yuv420p`;
  const filters = [
    base.replace(",format=yuv420p", ""),
    ...styleFilter(style, punchZoom, duration),
    ...(hook || cta ? creativeOverlays(ratio, hook, cta, accent) : []),
    "format=yuv420p",
  ];
  return filters.join(",");
}

export function trimArgs(input: string, output: string, start: number, end: number, ratio: AspectRatio, fit: FitMode, style: EditStyle = "clean", punchZoom = false, speed = 1, muted = false, hook = "", cta = "", accent = "#22c55e") {
  if (start < 0 || end <= start) throw new Error("Intervalo de corte inválido.");
  const duration = end - start;
  const safeSpeed = Math.min(4, Math.max(0.25, speed || 1));
  const vf = `${videoFilter(ratio, fit, style, punchZoom, duration, hook, cta, accent)},setpts=${(1 / safeSpeed).toFixed(4)}*PTS`;
  const args = [
    "-y",
    "-ss", start.toFixed(3),
    "-i", input,
    "-t", duration.toFixed(3),
    "-map", "0:v:0",
    "-vf", vf,
    "-r", "30",
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "23",
    "-movflags", "+faststart",
    "-avoid_negative_ts", "make_zero",
  ];
  if (muted || Math.abs(safeSpeed - 1) > 0.001) {
    args.push("-an");
  } else {
    args.push("-map", "0:a?", "-c:a", "aac", "-b:a", "128k");
  }
  args.push(output);
  return args;
}
