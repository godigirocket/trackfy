"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Upload, Music, Volume2, Play, Pause, Download, 
  Copy, RefreshCw, Smartphone, CheckCircle, ChevronRight, 
  ChevronLeft, AlertCircle, HelpCircle, Film, Check, Settings
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// Pre-made Prompt Examples
const PROMPT_EXAMPLES = [
  "Crie um vídeo vendendo meu site profissional",
  "Crie um vídeo mostrando antes e depois de um site",
  "Crie um vídeo para vender serviço no Instagram",
  "Crie um story com CTA para direct",
  "Crie um anúncio curto para tráfego pago"
];

// Video Presets
const PRESETS = [
  { id: "site-prof",     name: "Site Profissional",    desc: "Visual corporativo moderno e de alta credibilidade" },
  { id: "agencia-mkt",   name: "Agência de Marketing",  desc: "Dinâmico, criativo e com cortes rápidos" },
  { id: "infoproduto",   name: "Infoproduto",          desc: "Focado em transformação e escassez" },
  { id: "loja-online",   name: "Loja Online",          desc: "Destaque para produtos físicos e carrossel de fotos" },
  { id: "prest-servico", name: "Prestador de Serviço",  desc: "Focado em resolver a dor do cliente local" },
  { id: "consultoria",   name: "Consultoria",          desc: "Autoridade, profissionalismo e intelectualidade" },
  { id: "plano-saude",   name: "Plano de Saúde",       desc: "Confiança, cuidado familiar e facilidade" },
  { id: "prod-digital",  name: "Produto Digital",      desc: "Futurista, tecnológico e focado em facilidade" }
];

// Hooks
const HOOKS = [
  "Seu negócio perde cliente por causa disso",
  "Olha como um site muda a percepção da sua marca",
  "Se seu Instagram é sua única vitrine, você está limitado",
  "Cliente confia mais quando sua marca parece profissional",
  "Esse é o tipo de site que vende mesmo enquanto você dorme"
];

// CTAs
const CTAS = [
  "Chama no direct",
  "Peça seu orçamento",
  "Site a partir de 100€",
  "Clique no link da bio",
  "Fale comigo no Instagram @ojuangoes"
];

// Formats
const FORMATS = [
  { id: "reels", name: "Reels / TikTok", ratio: "9:16", desc: "9:16 vertical" },
  { id: "feed",  name: "Feed / Instagram", ratio: "1:1",  desc: "1:1 quadrado" },
  { id: "landscape", name: "Youtube / Landscape", ratio: "16:9", desc: "16:9 horizontal" }
];

const MUSIC_TRACKS = [
  { id: "synth", name: "Beat Synth Wave (Padrão)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "corporate", name: "Corporate Upbeat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "lofi", name: "Lo-Fi Beats Chill", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

// Pre-seeded history
const INITIAL_HISTORY = [
  {
    id: "vid-01",
    name: "Campanha Site Profissional - V1",
    date: "2026-06-28",
    format: "9:16 (Reels)",
    preset: "Site Profissional",
    status: "Renderizado",
    prompt: "Crie um vídeo vendendo meu site profissional",
    hook: "Seu negócio perde cliente por causa disso",
    cta: "Clique no link da bio",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-green-screen-39744-large.mp4"
  },
  {
    id: "vid-02",
    name: "Criativo Vendas Agência - V2",
    date: "2026-06-27",
    format: "1:1 (Feed)",
    preset: "Agência de Marketing",
    status: "Renderizado",
    prompt: "Crie um vídeo para vender serviço no Instagram",
    hook: "Se seu Instagram é sua única vitrine, você está limitado",
    cta: "Chama no direct",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-business-woman-using-a-tablet-41225-large.mp4"
  }
];

export default function VideoEnginePage() {
  // Navigation / Steps
  const [step, setStep] = useState(1);

  // Form selections
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<Array<{ 
    name: string; 
    size: string; 
    preset?: boolean;
    file?: File;
    url?: string;
    type?: 'image' | 'video' | 'audio';
  }>>([]);
  const [selectedFormat, setSelectedFormat] = useState("reels");
  const [selectedPreset, setSelectedPreset] = useState("site-prof");
  const [selectedHook, setSelectedHook] = useState(HOOKS[0]);
  const [selectedCta, setSelectedCta] = useState(CTAS[0]);
  const [selectedMusicTrack, setSelectedMusicTrack] = useState("synth");
  
  // Customization
  const [musicVolume, setMusicVolume] = useState(30);
  const [enableIntro, setEnableIntro] = useState(true);
  const [enableOutro, setEnableOutro] = useState(true);
  const [textAnimation, setTextAnimation] = useState("fade"); // fade, scale, slide
  const [safeMargins, setSafeMargins] = useState(true);

  // Execution states
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [history, setHistory] = useState<typeof INITIAL_HISTORY>([]);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string>("");
  const [playingPreview, setPlayingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "history">("builder");

  // Load history from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("tf_video_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      setHistory(INITIAL_HISTORY);
    }
  }, []);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.url && f.url.startsWith("blob:")) {
          URL.revokeObjectURL(f.url);
        }
      });
    };
  }, [files]);

  const saveHistory = (newHistory: typeof INITIAL_HISTORY) => {
    setHistory(newHistory);
    localStorage.setItem("tf_video_history", JSON.stringify(newHistory));
  };

  // Add demo files
  const addDemoFile = (fileName: string) => {
    if (files.some(f => f.name === fileName)) return;
    setFiles([...files, { name: fileName, size: "1.2 MB", preset: true }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files).map(f => {
        const type = f.type.startsWith("video/") ? "video" : f.type.startsWith("audio/") ? "audio" : "image";
        return {
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
          file: f,
          url: URL.createObjectURL(f),
          type: type as 'image' | 'video' | 'audio'
        };
      });
      setFiles([...files, ...fileList]);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Por favor, descreva o vídeo que deseja criar no Passo 1.");
      setStep(1);
      return;
    }

    const userVideo = files.find(f => f.type === 'video');
    const userAudio = files.find(f => f.type === 'audio');

    const audioSrc = userAudio?.url || MUSIC_TRACKS.find(m => m.id === selectedMusicTrack)?.url || MUSIC_TRACKS[0].url;

    // Fixed render duration: 12s for Reels, 10s for feed/landscape
    const RENDER_DURATION_S = selectedFormat === "reels" ? 12 : 10;

    setRendering(true);
    setRenderProgress(0);
    setActiveTab("builder");

    // Dimensions per format
    let width = 540, height = 960;
    if (selectedFormat === "feed") { width = 540; height = 540; }
    else if (selectedFormat === "landscape") { width = 960; height = 540; }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      alert("Não foi possível inicializar o canvas.");
      setRendering(false);
      return;
    }

    // Try to load user's own video (blob URL — no CORS)
    let videoEl: HTMLVideoElement | null = null;
    let videoReady = false;
    if (userVideo?.url) {
      videoEl = document.createElement("video");
      videoEl.src = userVideo.url;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.loop = true;
      videoReady = await new Promise<boolean>((resolve) => {
        videoEl!.oncanplay = () => resolve(true);
        videoEl!.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 3000);
        videoEl!.load();
      });
      if (videoReady) videoEl.play().catch(() => {});
    }

    // Try to play background music
    let audioCtx: AudioContext | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    const audioEl = document.createElement("audio");
    audioEl.src = audioSrc;
    audioEl.crossOrigin = "anonymous";
    audioEl.loop = true;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioCtxClass();
      const audioSource = audioCtx.createMediaElementSource(audioEl);
      const audioGain = audioCtx.createGain();
      audioGain.gain.value = musicVolume / 100;
      audioDest = audioCtx.createMediaStreamDestination();
      audioSource.connect(audioGain).connect(audioDest);
      if (audioCtx.state === "suspended") await audioCtx.resume();
      audioEl.play().catch(() => {});
    } catch (err) {
      console.warn("AudioContext setup failed:", err);
    }

    // Set up MediaRecorder
    const canvasStream = canvas.captureStream(30);
    const streamTracks = [...canvasStream.getVideoTracks()];
    if (audioDest) streamTracks.push(...audioDest.stream.getAudioTracks());
    const recordStream = new MediaStream(streamTracks);

    let mimeType = "";
    for (const m of ["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm","video/mp4",""]) {
      if (!m || MediaRecorder.isTypeSupported(m)) { mimeType = m; break; }
    }

    const recordedChunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(recordStream, mimeType ? { mimeType } : {});
    } catch (err) {
      alert("Seu navegador não suporta gravação de vídeo.");
      setRendering(false);
      return;
    }

    recorder.ondataavailable = (ev) => { if (ev.data?.size > 0) recordedChunks.push(ev.data); };

    recorder.onstop = () => {
      isDrawing = false;
      cancelAnimationFrame(rafId);
      audioEl.pause();
      if (videoEl) videoEl.pause();
      if (audioCtx) audioCtx.close().catch(() => {});

      const blob = new Blob(recordedChunks, { type: mimeType || "video/webm" });
      const outputUrl = URL.createObjectURL(blob);
      const newVideo = {
        id: "vid-" + Date.now(),
        name: `${PRESETS.find(p => p.id === selectedPreset)?.name || "Vídeo"} - Variação ${Math.floor(Math.random() * 100)}`,
        date: new Date().toISOString().split("T")[0],
        format: selectedFormat === "reels" ? "9:16 (Reels)" : selectedFormat === "feed" ? "1:1 (Feed)" : "16:9 (Landscape)",
        preset: PRESETS.find(p => p.id === selectedPreset)?.name || "Personalizado",
        status: "Renderizado",
        prompt,
        hook: selectedHook,
        cta: selectedCta,
        videoUrl: outputUrl,
      };
      saveHistory([newVideo, ...history]);
      setActivePreviewUrl(outputUrl);
      setPlayingPreview(true);
      setRenderProgress(100);
      setRendering(false);
    };

    // Gradient palette per preset
    const PRESET_COLORS: Record<string, [string, string, string]> = {
      "site-prof":    ["#0f2044", "#1a3a6e", "#0a1628"],
      "agencia-mkt":  ["#1a0533", "#3d0f6e", "#0d0219"],
      "infoproduto":  ["#0a2a1a", "#0f4d2e", "#061510"],
      "loja-online":  ["#2a0a0a", "#6e1414", "#150505"],
      "prest-servico":["#1a1a0a", "#4d4a0f", "#0d0d05"],
      "consultoria":  ["#0a0a2a", "#12126e", "#05050f"],
      "plano-saude":  ["#0a1f2a", "#0f4060", "#060f14"],
      "prod-digital": ["#0a0a1f", "#1a0a40", "#050510"],
    };
    const [c1, c2, c3] = PRESET_COLORS[selectedPreset] || ["#0a0a14", "#12183a", "#050510"];

    const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, lineH: number, fg: string, bg: string) => {
      ctx.font = `bold ${Math.round(width * 0.046)}px sans-serif`;
      const words = text.split(" ");
      let line = "", lines: string[] = [];
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > maxWidth && line) { lines.push(line.trim()); line = w + " "; }
        else line = test;
      }
      if (line.trim()) lines.push(line.trim());

      const bh = lines.length * lineH + 28;
      const bw = Math.min(maxWidth + 60, width - 30);
      const bx = x - bw / 2, by = y - bh / 2;
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 14) : ctx.rect(bx, by, bw, bh);
      ctx.fill();

      ctx.fillStyle = fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const startY = y - ((lines.length - 1) * lineH) / 2;
      lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
    };

    // Timer-based rendering
    const startTime = performance.now();
    let isDrawing = true;
    let rafId: number;
    let hue = 0;

    const drawFrame = () => {
      if (!isDrawing) return;
      const ctx2d = ctx!; // ctx is guaranteed non-null at this point
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(elapsed / RENDER_DURATION_S, 1);
      setRenderProgress(Math.round(progress * 99));

      // Draw background
      if (videoEl && videoReady) {
        try {
          ctx2d.drawImage(videoEl, 0, 0, width, height);
          ctx2d.fillStyle = "rgba(0,0,0,0.35)";
          ctx2d.fillRect(0, 0, width, height);
        } catch {
          drawGradientBg();
        }
      } else {
        drawGradientBg();
      }

      function drawGradientBg() {
        hue = (hue + 0.3) % 360;
        const grad = ctx2d.createRadialGradient(width / 2, height * 0.4, 0, width / 2, height / 2, width);
        grad.addColorStop(0, c2);
        grad.addColorStop(0.6, c1);
        grad.addColorStop(1, c3);
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(0, 0, width, height);

        // Animated particles
        for (let i = 0; i < 6; i++) {
          const px = (Math.sin(elapsed * 0.5 + i * 1.1) * 0.5 + 0.5) * width;
          const py = (Math.cos(elapsed * 0.3 + i * 0.9) * 0.5 + 0.5) * height;
          const gr = ctx2d.createRadialGradient(px, py, 0, px, py, width * 0.25);
          gr.addColorStop(0, `hsla(${(hue + i * 40) % 360}, 80%, 60%, 0.08)`);
          gr.addColorStop(1, "transparent");
          ctx2d.fillStyle = gr;
          ctx2d.fillRect(0, 0, width, height);
        }
      }

      // Safe area overlay
      if (safeMargins && selectedFormat === "reels") {
        ctx2d.strokeStyle = "rgba(255,255,255,0.08)";
        ctx2d.lineWidth = 2;
        ctx2d.setLineDash([6, 6]);
        ctx2d.strokeRect(20, 60, width - 40, height - 120);
        ctx2d.setLineDash([]);
      }

      // Hook — first 40% of video
      if (progress < 0.4) {
        const alpha = progress < 0.07 ? progress / 0.07 : progress > 0.33 ? (0.4 - progress) / 0.07 : 1;
        ctx2d.globalAlpha = alpha;
        drawWrappedText(
          selectedHook, width / 2, height * 0.35,
          width - 80, Math.round(height * 0.038),
          "#FFFFFF", "rgba(0,0,0,0.8)"
        );
        ctx2d.globalAlpha = 1;
      }

      // CTA — last 35% of video
      if (progress > 0.65) {
        const alpha = progress < 0.72 ? (progress - 0.65) / 0.07 : progress > 0.93 ? (1 - progress) / 0.07 : 1;
        ctx2d.globalAlpha = Math.max(0, alpha);
        drawWrappedText(
          selectedCta, width / 2, height * 0.75,
          width - 80, Math.round(height * 0.038),
          "#FFFFFF", "rgba(37,99,235,0.92)"
        );
        ctx2d.globalAlpha = 1;
      }

      // Progress bar at bottom
      const barH = 4, barY = height - barH;
      ctx2d.fillStyle = "rgba(255,255,255,0.15)";
      ctx2d.fillRect(0, barY, width, barH);
      ctx2d.fillStyle = "#3b82f6";
      ctx2d.fillRect(0, barY, width * progress, barH);

      if (elapsed < RENDER_DURATION_S) {
        rafId = requestAnimationFrame(drawFrame);
      } else {
        if (recorder.state !== "inactive") recorder.stop();
      }
    };

    recorder.start(100); // collect chunks every 100ms
    drawFrame();
  };

  const handleDuplicate = (video: typeof INITIAL_HISTORY[0]) => {
    const duplicated = {
      ...video,
      id: "vid-" + Date.now(),
      name: `${video.name} (Cópia)`,
      date: new Date().toISOString().split("T")[0],
    };
    saveHistory([duplicated, ...history]);
    alert("Vídeo duplicado com sucesso! Veja no histórico.");
  };

  const handleGenerateVariation = (video: typeof INITIAL_HISTORY[0]) => {
    setPrompt(video.prompt + " - Variação alternativa");
    setStep(4);
    setSelectedHook(video.hook);
    setSelectedCta(video.cta);
    setActiveTab("builder");
    alert("Dados preenchidos no gerador. Ajuste e gere a variação!");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" /> Video Engine <span className="badge badge-blue">SaaS Pro</span>
          </h1>
          <p className="text-[13px] mt-0.5 text-slate-400">
            Gere anúncios de alta conversão e criativos premium com hooks de vendas validados
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("builder")}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5", 
              activeTab === "builder" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Film className="w-4 h-4" /> Gerador
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn("px-4 py-2 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5", 
              activeTab === "history" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            Histórico <span className="badge bg-slate-800 text-slate-300 border border-slate-700 ml-1">{history.length}</span>
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form & Stepper Column */}
          <div className="lg:col-span-7 space-y-5">
            {/* Stepper Wizard Bar */}
            <div className="card p-4 bg-slate-950 border-slate-900">
              <div className="flex items-center justify-between max-w-lg mx-auto">
                {[
                  { num: 1, label: "Descrever" },
                  { num: 2, label: "Arquivos" },
                  { num: 3, label: "Formato & Presets" },
                  { num: 4, label: "Ajustes & Gerar" }
                ].map((s) => (
                  <button 
                    key={s.num} 
                    onClick={() => setStep(s.num)}
                    className="flex flex-col items-center gap-1 focus:outline-none"
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border transition-all",
                      step === s.num 
                        ? "bg-blue-600 text-white border-blue-500 ring-4 ring-blue-500/20" 
                        : step > s.num
                          ? "bg-blue-950 text-blue-400 border-blue-800"
                          : "bg-slate-900 text-slate-500 border-slate-800"
                    )}>
                      {step > s.num ? <Check className="w-4 h-4" strokeWidth={3} /> : s.num}
                    </div>
                    <span className={cn("text-[10px] font-bold transition-all",
                      step === s.num ? "text-white" : "text-slate-500"
                    )}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step Contents */}
            <div className="card p-5 space-y-4">
              {/* STEP 1: DESCRIBE THE VIDEO */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                      Passo 1: Descreva o vídeo que você quer criar
                    </h2>
                    <p className="text-[12px] text-slate-400">
                      Nossa inteligência artificial irá estruturar o roteiro e selecionar as melhores tomadas baseadas no seu prompt.
                    </p>
                  </div>

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="Ex: Crie um anúncio em formato reels vendendo o desenvolvimento de sites rápidos de alta qualidade em menos de 10 dias para empresas e profissionais autônomos..."
                    className="input font-sans text-[13px]"
                  />

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ou use um de nossos prompts validados:</span>
                    <div className="grid grid-cols-1 gap-2">
                      {PROMPT_EXAMPLES.map((ex) => (
                        <button
                          key={ex}
                          onClick={() => setPrompt(ex)}
                          className={cn("text-left px-3 py-2.5 rounded-xl border text-[12px] transition-all flex items-center justify-between",
                            prompt === ex 
                              ? "bg-blue-600/10 border-blue-500 text-white" 
                              : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                          )}
                        >
                          <span>{ex}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: UPLOAD ASSETS */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                      Passo 2: Envie seus arquivos
                    </h2>
                    <p className="text-[12px] text-slate-400">
                      Faça o upload de logos, imagens do produto, gravações de tela ou use um de nossos presets abaixo.
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <label className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950 transition-all">
                    <input type="file" multiple onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*" />
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-semibold text-white">Arraste e solte ou clique para enviar</span>
                    <span className="text-[11px] text-slate-500">Suporta PNG, JPG, MP4, MP3 (máximo 50MB)</span>
                  </label>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Arquivos Selecionados:</span>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {files.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-850">
                            <span className="text-[12px] font-semibold truncate text-white max-w-[250px]">{f.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500">{f.size}</span>
                              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="text-[10px] text-red-500 hover:underline">
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preset Assets */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Assets rápidos para teste (Clique para selecionar):</span>
                    <div className="flex flex-wrap gap-2">
                      {["logotipo_empresa.png", "mockup_dashboard.jpg", "antes_e_depois.png", "video_demo.mp4"].map((presetAsset) => (
                        <button
                          key={presetAsset}
                          onClick={() => addDemoFile(presetAsset)}
                          className={cn("px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                            files.some(f => f.name === presetAsset)
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                          )}
                        >
                          + {presetAsset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CHOOSE FORMAT & PRESET */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                      Passo 3: Escolha o formato e o preset
                    </h2>
                    <p className="text-[12px] text-slate-400">
                      Determine a proporção do vídeo e o nicho de mercado do template de design.
                    </p>
                  </div>

                  {/* Formatos de Vídeo */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">1. Formato (Proporção)</span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {FORMATS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFormat(f.id)}
                          className={cn("p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1",
                            selectedFormat === f.id 
                              ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/10" 
                              : "bg-slate-900 border-slate-850 hover:bg-slate-900 hover:border-slate-750"
                          )}
                        >
                          <Smartphone className={cn("w-5 h-5", f.id === "landscape" ? "rotate-90 text-slate-400" : "text-blue-500")} />
                          <span className="text-[12px] font-bold text-white mt-1">{f.name}</span>
                          <span className="text-[10px] text-slate-400">{f.ratio}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Presets do Nicho */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">2. Presets de Design & Roteiro</span>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {PRESETS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPreset(p.id)}
                          className={cn("p-3 rounded-xl border text-left transition-all flex flex-col gap-0.5",
                            selectedPreset === p.id 
                              ? "bg-blue-600/10 border-blue-500" 
                              : "bg-slate-900 border-slate-850 hover:bg-slate-900 hover:border-slate-750"
                          )}
                        >
                          <span className="text-[12px] font-bold text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400 leading-tight">{p.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: HOOKS, CTAS & MUSIC CONFIG */}
              {step === 4 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <h2 className="text-[16px] font-bold text-white flex items-center gap-1.5">
                      Passo 4: Hooks, CTAs e Áudio
                    </h2>
                    <p className="text-[12px] text-slate-400">
                      Configure os ganchos (hooks) de atenção que aparecem nos primeiros 3 segundos do vídeo e o CTA final.
                    </p>
                  </div>

                  {/* Hooks */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Selecione o Hook Automático:</label>
                    <select 
                      value={selectedHook} 
                      onChange={(e) => setSelectedHook(e.target.value)}
                      className="select py-2 text-[12px] text-white"
                    >
                      {HOOKS.map((h, idx) => (
                        <option key={idx} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Selecione o CTA de Encerramento:</label>
                    <select 
                      value={selectedCta} 
                      onChange={(e) => setSelectedCta(e.target.value)}
                      className="select py-2 text-[12px] text-white"
                    >
                      {CTAS.map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customizations */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-2 p-3 rounded-xl border border-slate-850 bg-slate-900/30">
                      <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1"><Music className="w-3.5 h-3.5" /> Música</span>
                      
                      <select 
                        value={selectedMusicTrack} 
                        onChange={(e) => setSelectedMusicTrack(e.target.value)}
                        className="select py-1 w-full text-[11px] bg-slate-950 text-white border border-slate-800 rounded-lg mb-2"
                      >
                        {MUSIC_TRACKS.map(track => (
                          <option key={track.id} value={track.id}>{track.name}</option>
                        ))}
                        {files.some(f => f.type === 'audio') && (
                          <option value="user-audio">🎵 Áudio Carregado</option>
                        )}
                      </select>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <input
                          type="range" min="0" max="100"
                          value={musicVolume}
                          onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <span className="text-[10px] text-slate-400 w-8 text-right font-mono">{musicVolume}%</span>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 rounded-xl border border-slate-850 bg-slate-900/30 flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Animação de Texto</span>
                      <select 
                        value={textAnimation} 
                        onChange={(e) => setTextAnimation(e.target.value)}
                        className="select py-1.5 text-[11px] bg-slate-950 text-white"
                      >
                        <option value="fade">Fade In suave</option>
                        <option value="scale">Escala saltitante</option>
                        <option value="slide">Slide debaixo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enableIntro} 
                        onChange={() => setEnableIntro(!enableIntro)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
                      />
                      <span className="text-[11px] font-semibold text-slate-300">Intro curta</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={enableOutro} 
                        onChange={() => setEnableOutro(!enableOutro)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
                      />
                      <span className="text-[11px] font-semibold text-slate-300">CTA Final</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={safeMargins} 
                        onChange={() => setSafeMargins(!safeMargins)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" 
                      />
                      <span className="text-[11px] font-semibold text-slate-300">Margem Reels/TikTok</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1 || rendering}
                className="btn-secondary px-4 py-2 text-[12px] flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(prev => Math.min(4, prev + 1))}
                  className="btn-primary px-5 py-2 text-[12px] flex items-center gap-1"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={rendering}
                  className="btn-primary px-6 py-2.5 text-[13px] flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/10 font-bold"
                >
                  {rendering ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Renderizando ({renderProgress}%)</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Gerar Criativo de Vídeo</>
                  )}
                </button>
              )}
            </div>

            {/* Progress rendering indicator */}
            {rendering && (
              <div className="card p-4 space-y-2 border-blue-500/20 bg-slate-950">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    Processando vídeo via Worker FFMpeg...
                  </span>
                  <span className="font-mono text-blue-400">{renderProgress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${renderProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">
                  Calculando keyframes, mesclando música de fundo, sobrepondo hook de atenção e exportando com margem segura.
                </p>
              </div>
            )}
          </div>

          {/* Premium Preview Device Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" /> Preview em Tempo Real (Simulador)
            </span>

            {/* Mobile Mockup Wrapper */}
            <div className="relative w-[280px] h-[520px] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 shadow-2xl flex flex-col overflow-hidden ring-4 ring-slate-900/30">
              {/* Speaker & camera notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 rounded-b-xl bg-slate-900 z-30 flex items-center justify-center">
                <div className="w-8 h-1 rounded-full bg-slate-850" />
              </div>

              {/* Screen container */}
              <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-4 bg-slate-900">
                {/* TikTok/Reels Overlay Mock (Safe Margins View) */}
                {safeMargins && selectedFormat === "reels" && (
                  <div className="absolute inset-0 border-y-[45px] border-x-[15px] border-red-500/10 pointer-events-none z-10">
                    <div className="w-full h-full border border-dashed border-red-500/30 flex flex-col justify-between items-center py-2">
                      <span className="text-[8px] font-bold text-red-500/60 uppercase tracking-widest bg-slate-950/70 px-1 rounded">Margem Segura Topo</span>
                      <span className="text-[8px] font-bold text-red-500/60 uppercase tracking-widest bg-slate-950/70 px-1 rounded">Margem Segura Base</span>
                    </div>
                  </div>
                )}

                {/* Video player simulation */}
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {activePreviewUrl ? (
                    <video
                      key={activePreviewUrl}
                      src={activePreviewUrl}
                      loop
                      muted
                      autoPlay
                      className={cn("w-full h-full object-cover",
                        selectedFormat === "feed" ? "aspect-square h-auto" : "h-full"
                      )}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <Film className="w-12 h-12 text-slate-800" strokeWidth={1.5} />
                      <span className="text-[12px] font-semibold text-slate-500">Configure os parâmetros e gere o vídeo para ver a preview aqui.</span>
                    </div>
                  )}
                </div>

                {/* Overlay Text/Hook Simulation inside video */}
                <div className="z-10 w-full text-center mt-8 px-2">
                  <div 
                    className={cn("p-2 rounded-xl bg-black/60 border border-white/10 text-white font-extrabold uppercase transition-all duration-300", 
                      textAnimation === "scale" ? "scale-105" : textAnimation === "slide" ? "translate-y-2" : "opacity-100",
                      selectedFormat === "feed" ? "text-[12px]" : "text-[14px]"
                    )}
                    style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
                  >
                    {selectedHook}
                  </div>
                </div>

                {/* Right side social actions mock (TikTok style) */}
                <div className="z-10 absolute right-2.5 bottom-16 flex flex-col items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">U</div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-850/60 flex items-center justify-center text-[9px]">❤️</div>
                    <span className="text-[8px] text-white">12K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-850/60 flex items-center justify-center text-[9px]">💬</div>
                    <span className="text-[8px] text-white">418</span>
                  </div>
                </div>

                {/* CTA Overlay Simulation at the bottom */}
                <div className="z-10 w-full mb-3 px-2">
                  <div className="bg-blue-600/90 text-white p-2 rounded-lg text-center font-bold text-[11px] animate-pulse flex items-center justify-center gap-1 shadow-md">
                    <span>{selectedCta}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Audio Track Info */}
            <div className="mt-4 p-3 rounded-2xl border border-slate-850 bg-slate-900/60 max-w-sm w-full flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-500 animate-spin" style={{ animationDuration: '6s' }}>
                <Music className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] text-slate-500 uppercase tracking-wider">Trilha Sonora Ativa</span>
                <span className="block text-[12px] font-semibold text-white truncate">Beat Eletrônico Energético Pro (Loop)</span>
              </div>
              <span className="text-[10px] text-blue-500 font-bold bg-blue-600/10 px-2 py-0.5 rounded">Volume: {musicVolume}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* HISTORY TAB */
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div>
              <h2 className="text-[16px] font-bold text-white">Biblioteca de Vídeos Criados</h2>
              <p className="text-[12px] text-slate-400">Download, duplicação e variações dos criativos gerados anteriormente</p>
            </div>
            <span className="text-[11px] font-bold text-slate-500">{history.length} criativos totais</span>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Film className="w-12 h-12 text-slate-800 mx-auto" />
              <p className="text-[14px] text-slate-400">Nenhum vídeo criado ainda. Vá na aba "Gerador" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}>
                    {["Vídeo Criado", "Preset / Roteiro", "Formato", "Data", "Status", "Ações"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((video) => (
                    <tr key={video.id} className="border-b hover:bg-slate-900/30 transition-colors" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setActivePreviewUrl(video.videoUrl);
                              setPlayingPreview(true);
                              setActiveTab("builder");
                            }}
                            className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all group"
                          >
                            <Play className="w-4 h-4 group-hover:scale-110 transition-all" />
                          </button>
                          <div>
                            <span className="block text-[13px] font-bold text-white">{video.name}</span>
                            <span className="block text-[10px] text-slate-500 max-w-[200px] truncate">{video.prompt}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-semibold text-slate-300">{video.preset}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-neutral text-[11px]">{video.format}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-400 font-mono">
                        {video.date}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-green text-[10px] flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> {video.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={video.videoUrl}
                            download={`${video.name}.mp4`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary p-1.5 text-[11px] flex items-center gap-1"
                            title="Baixar MP4"
                          >
                            <Download className="w-3.5 h-3.5" /> Baixar
                          </a>
                          <button
                            onClick={() => handleDuplicate(video)}
                            className="btn-secondary p-1.5 text-[11px] flex items-center gap-1"
                            title="Duplicar Configurações"
                          >
                            <Copy className="w-3.5 h-3.5" /> Duplicar
                          </button>
                          <button
                            onClick={() => handleGenerateVariation(video)}
                            className="btn-secondary p-1.5 text-[11px] flex items-center gap-1 text-blue-400 hover:text-blue-300"
                            title="Gerar Variação"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Variação
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
