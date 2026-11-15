export const PAY_APPS = [
  { id: "any", name: "सभी UPI ऐप", prefix: "upi://pay" },
  { id: "gpay", name: "Google Pay", prefix: "tez://upi/pay" },
  { id: "phonepe", name: "PhonePe", prefix: "phonepe://pay" },
  { id: "paytm", name: "Paytm", prefix: "paytmmp://pay" },
  { id: "bhim", name: "BHIM", prefix: "bhim://upi/pay" },
  { id: "bharatpe", name: "BharatPe", prefix: "upi://pay" },
  { id: "amazonpay", name: "Amazon Pay", prefix: "amazonpay://upi/pay" },
  { id: "cred", name: "CRED", prefix: "credpay://upi/pay" },
] as const;

export type PayAppId = (typeof PAY_APPS)[number]["id"];

export const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000] as const;

const VPA = /^[a-z0-9][a-z0-9._-]{1,49}@[a-z][a-z0-9]{1,30}$/;
const AMOUNT_MAX = 100000;
const UPI_STORAGE_KEY = "qr-maker-upi-v1";
const LEDGER_KEY = "qr-maker-ledger-v1";
const LEDGER_LIMIT = 80;

export type UpiMode = "pay" | "text";

export type UpiDraft = {
  pa: string;
  pn: string;
  amount: string;
  note: string;
  ref: string;
  appId: PayAppId;
};

export type PaySummary = {
  link: string;
  appUrl: string;
  appId: PayAppId;
  appName: string;
  pa: string;
  pn: string;
  amount: number;
  amountLabel: string;
  note: string;
  ref: string;
};

export type LedgerStatus = "pending" | "received";

export type LedgerEntry = {
  id: string;
  createdAt: number;
  receivedAt: number | null;
  pa: string;
  pn: string;
  amount: number;
  note: string;
  ref: string;
  appId: PayAppId;
  appName: string;
  status: LedgerStatus;
};

export const EMPTY_DRAFT: UpiDraft = {
  pa: "",
  pn: "",
  amount: "",
  note: "",
  ref: "",
  appId: "any",
};

export function payApp(id: string) {
  return PAY_APPS.find((app) => app.id === id) ?? PAY_APPS[0];
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

function enc(value: string): string {
  return encodeURIComponent(value);
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "");
  if (!cleaned || !/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0 || value > AMOUNT_MAX) return null;
  return Math.round(value * 100) / 100;
}

export function normalizeVpa(raw: string): string | null {
  const vpa = raw.trim().toLowerCase().replace(/\s+/g, "");
  if (!VPA.test(vpa)) return null;
  return vpa;
}

function query(fields: { pa: string; pn: string; amount: string; note: string; ref: string }): string {
  const parts = [`pa=${enc(fields.pa)}`, `pn=${enc(fields.pn)}`, `am=${enc(fields.amount)}`, "cu=INR"];
  if (fields.note) parts.push(`tn=${enc(fields.note)}`);
  if (fields.ref) parts.push(`tr=${enc(fields.ref)}`);
  return parts.join("&");
}

export function describePayment(draft: UpiDraft): {
  summary: PaySummary | null;
  error: string | null;
  hint: string | null;
} {
  const paRaw = draft.pa.trim();
  const pn = draft.pn.trim().replace(/\s+/g, " ").slice(0, 50);
  const amountRaw = draft.amount.trim();
  const note = draft.note.trim().replace(/\s+/g, " ").slice(0, 80);
  const ref = draft.ref.trim().replace(/[^a-zA-Z0-9-]/g, "").slice(0, 35);
  const touched = paRaw || pn || amountRaw || note || ref;

  if (!touched) {
    return { summary: null, error: null, hint: "UPI ID, नाम और राशि डालें।" };
  }

  const pa = normalizeVpa(paRaw);
  if (!pa) {
    return {
      summary: null,
      error: "UPI ID ऐसा हो: name@okaxis, name@ybl या name@paytm।",
      hint: null,
    };
  }
  if (pn.length < 2) {
    return { summary: null, error: "पैसे पाने वाले का नाम डालें।", hint: null };
  }
  const amount = parseAmount(amountRaw);
  if (amount === null) {
    return {
      summary: null,
      error: "राशि 0 से बड़ी और ₹1,00,000 तक डालें। पैसे दो दशमलव तक।",
      hint: null,
    };
  }

  const app = payApp(draft.appId);
  const qs = query({ pa, pn, amount: amount.toFixed(2), note, ref });
  const link = `upi://pay?${qs}`;
  return {
    summary: {
      link,
      appUrl: `${app.prefix}?${qs}`,
      appId: app.id,
      appName: app.name,
      pa,
      pn,
      amount,
      amountLabel: formatInr(amount),
      note,
      ref,
    },
    error: null,
    hint: null,
  };
}

export function loadUpiState(): { draft: UpiDraft; mode: UpiMode } | null {
  try {
    const raw = localStorage.getItem(UPI_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<UpiDraft & { mode: UpiMode }>;
    const appId = payApp(typeof data.appId === "string" ? data.appId : "any").id;
    return {
      mode: data.mode === "text" ? "text" : "pay",
      draft: {
        pa: typeof data.pa === "string" ? data.pa.slice(0, 80) : "",
        pn: typeof data.pn === "string" ? data.pn.slice(0, 50) : "",
        amount: typeof data.amount === "string" ? data.amount.slice(0, 12) : "",
        note: typeof data.note === "string" ? data.note.slice(0, 80) : "",
        ref: typeof data.ref === "string" ? data.ref.slice(0, 35) : "",
        appId,
      },
    };
  } catch {
    return null;
  }
}

export function saveUpiState(draft: UpiDraft, mode: UpiMode) {
  try {
    localStorage.setItem(UPI_STORAGE_KEY, JSON.stringify({ ...draft, mode }));
  } catch {
    // The form still works for this visit.
  }
}

export function loadLedger(): LedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Partial<LedgerEntry>;
      if (typeof row.id !== "string" || typeof row.pa !== "string" || typeof row.amount !== "number") {
        return [];
      }
      const status: LedgerStatus = row.status === "received" ? "received" : "pending";
      return [
        {
          id: row.id,
          createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
          receivedAt: typeof row.receivedAt === "number" ? row.receivedAt : null,
          pa: row.pa,
          pn: typeof row.pn === "string" ? row.pn : "",
          amount: row.amount,
          note: typeof row.note === "string" ? row.note : "",
          ref: typeof row.ref === "string" ? row.ref : "",
          appId: payApp(typeof row.appId === "string" ? row.appId : "any").id,
          appName: typeof row.appName === "string" ? row.appName : payApp("any").name,
          status,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function saveLedger(entries: LedgerEntry[]) {
  try {
    localStorage.setItem(LEDGER_KEY, JSON.stringify(entries.slice(0, LEDGER_LIMIT)));
  } catch {
    // Ignore quota errors. The list stays on screen for this visit.
  }
}

export function ledgerTotals(entries: LedgerEntry[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = start.getTime();
  let asked = 0;
  let got = 0;
  let pending = 0;
  let todayGot = 0;
  for (const entry of entries) {
    asked += entry.amount;
    if (entry.status === "received") {
      got += entry.amount;
      const when = entry.receivedAt ?? entry.createdAt;
      if (when >= today) todayGot += entry.amount;
    } else {
      pending += entry.amount;
    }
  }
  return { asked, got, pending, todayGot };
}

export function entryFromSummary(summary: PaySummary): LedgerEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    receivedAt: null,
    pa: summary.pa,
    pn: summary.pn,
    amount: summary.amount,
    note: summary.note,
    ref: summary.ref,
    appId: summary.appId,
    appName: summary.appName,
    status: "pending",
  };
}
