export type AspectRatio = "9:16" | "1:1" | "16:9";
export type FitMode = "cover" | "contain";
export type EditStyle = "clean" | "capcut" | "ads" | "cinematic";

export interface VideoAsset {
  id: string;
  name: string;
  file: File;
  url: string;
  duration: number;
  thumbnail?: string;
}

export interface VideoClip {
  id: string;
  assetId: string;
  name: string;
  start: number;
  end: number;
  speed?: number;
  muted?: boolean;
}

export interface VideoProject {
  id: string;
  name: string;
  clips: VideoClip[];
  ratio: AspectRatio;
  fit: FitMode;
  style?: EditStyle;
  punchZoom?: boolean;
  hook: string;
  cta: string;
  accent?: string;
  updatedAt: string;
}
