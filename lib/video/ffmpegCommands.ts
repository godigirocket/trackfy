import type { AspectRatio, FitMode } from "./types";

const dimensions: Record<AspectRatio, [number, number]> = { "9:16": [720, 1280], "1:1": [720, 720], "16:9": [1280, 720] };

export function videoFilter(ratio: AspectRatio, fit: FitMode) {
  const [w, h] = dimensions[ratio];
  return fit === "cover"
    ? `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},setsar=1`
    : `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black,setsar=1`;
}

export function trimArgs(input: string, output: string, start: number, end: number, ratio: AspectRatio, fit: FitMode) {
  if (start < 0 || end <= start) throw new Error("Intervalo de corte inválido.");
  return ["-ss", start.toFixed(3), "-to", end.toFixed(3), "-i", input, "-vf", videoFilter(ratio, fit),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", "-movflags", "+faststart", output];
}
