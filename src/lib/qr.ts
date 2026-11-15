import type { ErrorCorrectionLevel, RenderOptions } from "qrcode";

export type EccLevel = ErrorCorrectionLevel;

export const SIZE_MIN = 192;
export const SIZE_MAX = 768;
export const SIZE_STEP = 16;
export const DEFAULT_SIZE = 320;

export const DEFAULTS = {
  text: "https://example.com",
  fg: "#111114",
  bg: "#f7f4ee",
  size: DEFAULT_SIZE,
  ecc: "M" as EccLevel,
};

export const EXAMPLES = [
  { label: "Link", value: "https://example.com" },
  { label: "Note", value: "Meet at the north gate, 6pm" },
  { label: "Email", value: "mailto:hello@example.com" },
] as const;

export const PRESETS = [
  { name: "Ink", fg: "#111114", bg: "#f7f4ee" },
  { name: "Chalk", fg: "#f4f1ea", bg: "#16181d" },
  { name: "Navy", fg: "#10243f", bg: "#e7eef6" },
  { name: "Pine", fg: "#143028", bg: "#e7f0ea" },
] as const;

export const ECC_LEVELS = [
  {
    id: "L",
    name: "Low",
    recovery: "7%",
    hint: "Smallest code. Use when the image stays clean and sharp.",
  },
  {
    id: "M",
    name: "Medium",
    recovery: "15%",
    hint: "A solid default for links and short notes.",
  },
  {
    id: "Q",
    name: "Quartile",
    recovery: "25%",
    hint: "Safer if the code might get a little worn.",
  },
  {
    id: "H",
    name: "High",
    recovery: "30%",
    hint: "Most recovery. Best when the print can get damaged.",
  },
] as const;

const STORAGE_KEY = "qr-maker-settings-v1";

type QrLib = {
  create: (
    text: string,
    options?: { errorCorrectionLevel?: EccLevel },
  ) => { version: number; modules: { size: number } };
  toDataURL: (text: string, options?: RenderOptions) => Promise<string>;
};

let qrPromise: Promise<QrLib> | null = null;

export function loadQr(): Promise<QrLib> {
  if (!qrPromise) {
    qrPromise = import("qrcode").then((mod) => {
      const named = mod as unknown as QrLib & { default?: QrLib };
      if (typeof named.toDataURL === "function" && typeof named.create === "function") {
        return named;
      }
      if (
        named.default &&
        typeof named.default.toDataURL === "function" &&
        typeof named.default.create === "function"
      ) {
        return named.default;
      }
      throw new Error("QR library failed to load.");
    });
  }
  return qrPromise;
}

export function renderOptions(ecc: EccLevel, fg: string, bg: string, width?: number): RenderOptions {
  return {
    errorCorrectionLevel: ecc,
    margin: 4,
    width,
    color: { dark: fg, light: bg },
  };
}

export function normalizeHex(raw: string): string | null {
  const trimmed = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(trimmed)) return null;
  return `#${trimmed.toLowerCase()}`;
}

export function clampSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SIZE;
  const stepped = Math.round(value / SIZE_STEP) * SIZE_STEP;
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, stepped));
}

export function contrastRatio(a: string, b: string): number {
  const hi = Math.max(relativeLuminance(a), relativeLuminance(b));
  const lo = Math.min(relativeLuminance(a), relativeLuminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

function relativeLuminance(hex: string): number {
  const n = Number.parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function friendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  if (/too big/i.test(raw)) {
    return "That text is too long for this error correction. Shorten it, or switch to L.";
  }
  return "Could not build a QR code from this text.";
}

export type Settings = {
  text: string;
  fg: string;
  bg: string;
  size: number;
  ecc: EccLevel;
};

export function loadSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Settings>;
    const ecc = data.ecc;
    if (ecc !== "L" && ecc !== "M" && ecc !== "Q" && ecc !== "H") return null;
    const fg = typeof data.fg === "string" ? normalizeHex(data.fg) : null;
    const bg = typeof data.bg === "string" ? normalizeHex(data.bg) : null;
    if (!fg || !bg || typeof data.text !== "string") return null;
    return {
      text: data.text.slice(0, 8000),
      fg,
      bg,
      size: clampSize(Number(data.size)),
      ecc,
    };
  } catch {
    return null;
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable. The generator still works for this visit.
  }
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const [header, data] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(header ?? "")?.[1] ?? "image/png";
  const binary = atob(data ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function previewAlt(text: string): string {
  const trimmed = text.trim();
  const shown = trimmed.length > 180 ? `${trimmed.slice(0, 177)}…` : trimmed;
  return `QR code for ${shown}`;
}
