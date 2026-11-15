import { Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpiFields, UpiLedger, useUpiDesk } from "@/components/upi-desk";
import {
  DEFAULTS,
  ECC_LEVELS,
  EXAMPLES,
  PRESETS,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  clampSize,
  contrastRatio,
  downloadDataUrl,
  friendlyError,
  loadQr,
  loadSettings,
  normalizeHex,
  previewAlt,
  renderOptions,
  saveSettings,
  type EccLevel,
  type Settings,
} from "@/lib/qr";
import { cn } from "@/lib/utils";

const PREVIEW_PX = 480;

type Preview = {
  url: string;
  version: number;
  modules: number;
};

export function QrStudio() {
  const desk = useUpiDesk();
  const [text, setText] = useState(DEFAULTS.text);
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const [size, setSize] = useState(DEFAULTS.size);
  const [ecc, setEcc] = useState<EccLevel>(DEFAULTS.ecc);
  const [hydrated, setHydrated] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const encoded = desk.mode === "pay" ? (desk.payment.summary?.link ?? "") : text;
  const paySummary = desk.mode === "pay" ? desk.payment.summary : null;

  useEffect(() => {
    const saved = loadSettings();
    if (saved) applySettings(saved, { setText, setFg, setBg, setSize, setEcc });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings({ text, fg, bg, size, ecc });
  }, [hydrated, text, fg, bg, size, ecc]);

  useEffect(() => {
    if (!hydrated || !encoded.trim()) {
      if (!encoded.trim()) {
        setPreview(null);
        setPreviewFor(null);
        setError(null);
      }
      return;
    }

    let cancel = false;
    (async () => {
      try {
        const QR = await loadQr();
        if (cancel) return;
        const created = QR.create(encoded, { errorCorrectionLevel: ecc });
        const url = await QR.toDataURL(encoded, renderOptions(ecc, fg, bg, PREVIEW_PX));
        if (cancel) return;
        setPreview({
          url,
          version: created.version,
          modules: created.modules.size,
        });
        setPreviewFor(encoded);
        setError(null);
      } catch (err) {
        if (cancel) return;
        setPreview(null);
        setPreviewFor(null);
        setError(friendlyError(err));
      }
    })();

    return () => {
      cancel = true;
    };
  }, [hydrated, encoded, fg, bg, ecc]);

  useEffect(() => {
    if (!encoded.trim()) {
      setAnnouncement(
        desk.mode === "pay"
          ? "पेमेंट QR खाली है। UPI ID, नाम और राशि डालें।"
          : "Preview is empty. Type a link or some text.",
      );
      return;
    }
    if (error) {
      setAnnouncement("");
      return;
    }
    if (!preview || previewFor !== encoded) return;
    const id = window.setTimeout(() => {
      setAnnouncement(
        desk.mode === "pay" && paySummary
          ? `पेमेंट QR तैयार। ${paySummary.amountLabel}, ${paySummary.pa}।`
          : `QR code updated. Version ${preview.version}, ${preview.modules} by ${preview.modules} modules. PNG is ${size} by ${size} pixels.`,
      );
    }, 700);
    return () => window.clearTimeout(id);
  }, [encoded, error, preview, previewFor, size, desk.mode, paySummary]);

  const shownError = desk.mode === "pay" ? (desk.payment.error ?? error) : error;
  const previewReady = Boolean(preview && previewFor === encoded && encoded.trim() && !shownError);
  const canDownload = previewReady && !saving;

  async function onDownload() {
    if (!canDownload) return;
    setSaving(true);
    try {
      const QR = await loadQr();
      const url = await QR.toDataURL(encoded, renderOptions(ecc, fg, bg, size));
      const filename =
        paySummary ? `upi-${paySummary.amount.toFixed(2)}.png` : "qr-code.png";
      downloadDataUrl(url, filename);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function onCopy() {
    if (!paySummary) return;
    try {
      await navigator.clipboard.writeText(paySummary.link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const ratio = contrastRatio(fg, bg);
  const lowContrast = ratio < 3;
  const level = ECC_LEVELS.find((item) => item.id === ecc) ?? ECC_LEVELS[1];

  return (
    <div className="shell">
      <a
        href="#qr-preview"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to preview
      </a>
      <header className="mb-5 flex items-center gap-3">
        <img src="/favicon.svg" alt="" width={36} height={36} className="size-9 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-balance">QR Maker</h1>
          <p className="text-sm text-pretty text-muted">
            UPI पेमेंट QR या कोई भी लिंक। स्कैन पर राशि के साथ पेमेंट स्क्रीन खुलती है।
          </p>
        </div>
      </header>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
        <section aria-label="Settings" className="order-2 rounded-xl border border-border bg-surface p-4 lg:order-1">
          <div className="mb-4 grid grid-cols-2 gap-2" role="group" aria-label="QR का प्रकार">
            <Button
              type="button"
              variant="outline"
              aria-pressed={desk.mode === "pay"}
              onClick={() => desk.setMode("pay")}
            >
              पेमेंट
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-pressed={desk.mode === "text"}
              onClick={() => desk.setMode("text")}
            >
              लिंक या टेक्स्ट
            </Button>
          </div>
          <div className="divide-y divide-border">
            {desk.mode === "pay" ? (
              <UpiFields draft={desk.draft} patch={desk.patch} />
            ) : (
            <div className="flex flex-col gap-2 pb-5">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste a link or type a note"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={8000}
                aria-describedby="content-count"
              />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Examples">
                {EXAMPLES.map((example) => (
                  <Button
                    key={example.label}
                    type="button"
                    variant="outline"
                    aria-pressed={text === example.value}
                    onClick={() => setText(example.value)}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
              <p id="content-count" className="text-sm text-muted tabular-nums">
                {text.length} {text.length === 1 ? "character" : "characters"}
              </p>
            </div>
            )}

            <div className="flex flex-col gap-4 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField id="foreground" label="Foreground" value={fg} onChange={setFg} />
                <ColorField id="background" label="Background" value={bg} onChange={setBg} />
              </div>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Color presets">
                {PRESETS.map((preset) => {
                  const selected = preset.fg === fg && preset.bg === bg;
                  return (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      aria-pressed={selected}
                      onClick={() => {
                        setFg(preset.fg);
                        setBg(preset.bg);
                      }}
                      className={cn("w-full", selected && "border-fg bg-fg text-accent-fg hover:bg-fg")}
                    >
                      <span className="flex items-center gap-2">
                        <span className="flex" aria-hidden="true">
                          <span
                            className="swatch size-4 rounded-full"
                            style={{ backgroundColor: preset.fg }}
                          />
                          <span
                            className="swatch -ml-1 size-4 rounded-full"
                            style={{ backgroundColor: preset.bg }}
                          />
                        </span>
                        {preset.name}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 py-5">
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor="export-size">PNG size</Label>
                <span className="text-sm font-medium tabular-nums">
                  {size}×{size}
                </span>
              </div>
              <input
                id="export-size"
                className="size-range"
                type="range"
                min={SIZE_MIN}
                max={SIZE_MAX}
                step={SIZE_STEP}
                value={size}
                onChange={(event) => setSize(clampSize(Number(event.target.value)))}
                aria-valuemin={SIZE_MIN}
                aria-valuemax={SIZE_MAX}
                aria-valuenow={size}
                aria-valuetext={`${size} by ${size} pixels`}
                aria-describedby="size-hint"
              />
              <p id="size-hint" className="text-sm text-muted">
                Pixel size of the downloaded PNG. A quiet zone is included.
              </p>
            </div>

            <fieldset className="pt-5" aria-describedby="ecc-hint">
              <legend className="text-sm font-medium text-fg">Error correction</legend>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {ECC_LEVELS.map((item) => {
                  const checked = item.id === ecc;
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-sm border px-1 py-2 text-center",
                        checked
                          ? "border-fg bg-fg text-accent-fg"
                          : "border-border bg-bg text-fg",
                      )}
                    >
                      <input
                        type="radio"
                        name="error-correction"
                        value={item.id}
                        checked={checked}
                        onChange={() => setEcc(item.id)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium" aria-hidden="true">
                        {item.id}
                      </span>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          checked ? "text-accent-fg" : "text-muted",
                        )}
                        aria-hidden="true"
                      >
                        {item.recovery}
                      </span>
                      <span className="sr-only">
                        {item.name}. {item.recovery} recovery.
                      </span>
                    </label>
                  );
                })}
              </div>
              <p id="ecc-hint" className="mt-2 text-sm text-muted">
                {level.hint}
                {desk.mode === "pay" && (ecc === "L" || ecc === "M")
                  ? " पेमेंट QR के लिए Q या H ज़्यादा सुरक्षित है।"
                  : ""}
              </p>
            </fieldset>
          </div>
        </section>

        <section
          id="qr-preview"
          aria-labelledby="preview-heading"
          className="order-1 rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-6 lg:order-2 lg:w-80"
        >
          <h2 id="preview-heading" className="text-sm font-medium">
            Live preview
          </h2>
          <div
            className="preview-frame mx-auto mt-3 overflow-hidden rounded-sm border border-border bg-bg"
            style={{ maxWidth: size }}
          >
            <div className="flex aspect-square w-full items-center justify-center">
              {previewReady && preview ? (
                <img
                  src={preview.url}
                  alt={
                    paySummary
                      ? `UPI payment QR for ${paySummary.pn}, ${paySummary.amountLabel}`
                      : previewAlt(encoded)
                  }
                  width={PREVIEW_PX}
                  height={PREVIEW_PX}
                  decoding="sync"
                  className="block h-full w-full"
                  aria-describedby={lowContrast ? "contrast-warning" : undefined}
                />
              ) : (
                <p
                  className={cn("px-4 text-center text-sm", shownError ? "text-fg" : "text-muted")}
                  role={shownError ? "alert" : undefined}
                >
                  {shownError ??
                    (desk.mode === "pay"
                      ? (desk.payment.hint ?? "पेमेंट QR बन रहा है…")
                      : encoded.trim()
                        ? "Generating preview…"
                        : "Type a link or some text to generate a code.")}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {previewReady && preview ? (
              <p className="text-center text-sm text-muted tabular-nums">
                Version {preview.version} · {preview.modules}×{preview.modules}
              </p>
            ) : null}
            {paySummary ? (
              <div className="text-center">
                <p className="text-lg font-semibold tabular-nums">{paySummary.amountLabel}</p>
                <p className="text-sm text-muted">
                  {paySummary.pn} · {paySummary.pa}
                </p>
                <p className="text-sm text-muted">{paySummary.appName}</p>
              </div>
            ) : null}
            {paySummary ? (
              <Input
                readOnly
                value={paySummary.link}
                aria-label="UPI लिंक"
                onFocus={(event) => event.currentTarget.select()}
                className="font-mono"
              />
            ) : null}
            {previewReady && lowContrast ? (
              <p id="contrast-warning" className="text-center text-sm text-fg">
                Low contrast ({ratio.toFixed(1)}:1). Scanners may not read this.
              </p>
            ) : null}
            {paySummary ? (
              <>
                <Button type="button" variant="outline" className="w-full" onClick={() => void onCopy()}>
                  <Copy aria-hidden="true" className="size-4" />
                  {copied ? "लिंक कॉपी हो गया" : "UPI लिंक कॉपी"}
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <a href={paySummary.appUrl}>{paySummary.appName} में खोलें</a>
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={!canDownload}
              aria-busy={saving}
              onClick={() => {
                void onDownload();
              }}
              aria-label={`Download PNG, ${size} by ${size} pixels`}
            >
              <Download aria-hidden="true" className="size-4" />
              {saving ? "Preparing PNG…" : "Download PNG"}
            </Button>
          </div>
        </section>
      </div>
      {desk.mode === "pay" ? (
        <UpiLedger
          summary={desk.payment.summary}
          entries={desk.entries}
          totals={desk.totals}
          onAdd={desk.addEntry}
          onToggle={desk.toggleEntry}
          onRemove={desk.removeEntry}
        />
      ) : null}
    </div>
  );
}

function applySettings(
  saved: Settings,
  setters: {
    setText: (value: string) => void;
    setFg: (value: string) => void;
    setBg: (value: string) => void;
    setSize: (value: number) => void;
    setEcc: (value: EccLevel) => void;
  },
) {
  setters.setText(saved.text);
  setters.setFg(saved.fg);
  setters.setBg(saved.bg);
  setters.setSize(saved.size);
  setters.setEcc(saved.ecc);
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const errorId = `${id}-error`;
  const parsed = normalizeHex(draft);
  const showInvalid = draft.trim().length >= 7 && parsed === null;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`${id}-hex`}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={`${id}-picker`}
          className="color-input"
          type="color"
          value={value}
          aria-label={`${label} picker`}
          onChange={(event) => onChange(event.target.value.toLowerCase())}
        />
        <Input
          id={`${id}-hex`}
          value={draft}
          aria-label={`${label} hex`}
          aria-invalid={showInvalid}
          aria-describedby={showInvalid ? errorId : undefined}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          maxLength={7}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            const hex = normalizeHex(next);
            if (hex) onChange(hex);
          }}
          onBlur={() => {
            if (normalizeHex(draft) === null) setDraft(value);
          }}
          className={cn("min-w-0 flex-1 font-mono uppercase", showInvalid && "border-fg")}
        />
      </div>
      {showInvalid ? (
        <p id={errorId} className="text-sm text-fg" role="alert">
          Use a 6-digit hex color, like #112233.
        </p>
      ) : null}
    </div>
  );
}
