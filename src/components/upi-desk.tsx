import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_DRAFT,
  PAY_APPS,
  QUICK_AMOUNTS,
  describePayment,
  entryFromSummary,
  formatInr,
  ledgerTotals,
  loadLedger,
  loadUpiState,
  saveLedger,
  saveUpiState,
  type LedgerEntry,
  type PaySummary,
  type UpiDraft,
  type UpiMode,
} from "@/lib/upi";
import { cn } from "@/lib/utils";

export function useUpiDesk() {
  const [draft, setDraft] = useState<UpiDraft>(EMPTY_DRAFT);
  const [mode, setMode] = useState<UpiMode>("pay");
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    const saved = loadUpiState();
    if (saved) {
      setDraft(saved.draft);
      setMode(saved.mode);
    }
    setEntries(loadLedger());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveUpiState(draft, mode);
  }, [ready, draft, mode]);

  useEffect(() => {
    if (!ready) return;
    saveLedger(entries);
  }, [ready, entries]);

  const payment = describePayment(draft);

  function patch(partial: Partial<UpiDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function addEntry(summary: PaySummary) {
    setEntries((current) => [entryFromSummary(summary), ...current].slice(0, 80));
  }

  function toggleEntry(id: string) {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        const received = entry.status !== "received";
        return {
          ...entry,
          status: received ? "received" : "pending",
          receivedAt: received ? Date.now() : null,
        };
      }),
    );
  }

  function removeEntry(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  return {
    draft,
    patch,
    mode,
    setMode,
    payment,
    entries,
    addEntry,
    toggleEntry,
    removeEntry,
    totals: ledgerTotals(entries),
  };
}

export function UpiFields({
  draft,
  patch,
}: {
  draft: UpiDraft;
  patch: (partial: Partial<UpiDraft>) => void;
}) {
  return (
    <div className="flex flex-col gap-4 pb-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="upi-id">UPI ID</Label>
        <Input
          id="upi-id"
          value={draft.pa}
          onChange={(event) => patch({ pa: event.target.value })}
          placeholder="name@okaxis"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="payee-name">नाम</Label>
        <Input
          id="payee-name"
          value={draft.pn}
          onChange={(event) => patch({ pn: event.target.value })}
          placeholder="पैसे किसके खाते में जाएँ"
          autoComplete="name"
          maxLength={50}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="pay-amount">राशि</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted" aria-hidden="true">
            ₹
          </span>
          <Input
            id="pay-amount"
            value={draft.amount}
            onChange={(event) => patch({ amount: event.target.value })}
            placeholder="100"
            inputMode="decimal"
            autoComplete="off"
            className="tabular-nums"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="जल्दी राशि">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              aria-pressed={draft.amount === String(value)}
              onClick={() => patch({ amount: String(value) })}
            >
              ₹{value}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pay-note">नोट</Label>
          <Input
            id="pay-note"
            value={draft.note}
            onChange={(event) => patch({ note: event.target.value })}
            placeholder="किराया, बिल, दोस्त"
            maxLength={80}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pay-ref">रिफरेंस</Label>
          <Input
            id="pay-ref"
            value={draft.ref}
            onChange={(event) => patch({ ref: event.target.value })}
            placeholder="वैकल्पिक"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={35}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium" id="pay-app-label">
          किस ऐप से पेमेंट
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby="pay-app-label">
          {PAY_APPS.map((app) => (
            <Button
              key={app.id}
              type="button"
              variant="outline"
              aria-pressed={draft.appId === app.id}
              onClick={() => patch({ appId: app.id })}
              className="w-full"
            >
              {app.name}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted">
          QR हमेशा स्टैंडर्ड UPI लिंक है। स्कैन करते ही राशि भरी पेमेंट स्क्रीन खुलती है, Google Pay,
          PhonePe, Paytm, BHIM या बैंक ऐप में। चुना हुआ ऐप नीचे वाले बटन से सीधे खुलता है।
        </p>
      </div>
    </div>
  );
}

export function UpiLedger({
  summary,
  entries,
  totals,
  onAdd,
  onToggle,
  onRemove,
}: {
  summary: PaySummary | null;
  entries: LedgerEntry[];
  totals: ReturnType<typeof ledgerTotals>;
  onAdd: (summary: PaySummary) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section aria-labelledby="ledger-heading" className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ledger-heading" className="text-base font-semibold">
            हिसाब
          </h2>
          <p className="text-sm text-muted">रिक्वेस्ट यहीं सेव होती है। पैसा आ जाए तो मिला मार्क करें।</p>
        </div>
        <Button type="button" disabled={!summary} onClick={() => summary && onAdd(summary)}>
          हिसाब में जोड़ें
        </Button>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="माँगा" value={formatInr(totals.asked)} />
        <Stat label="मिला" value={formatInr(totals.got)} />
        <Stat label="बाकी" value={formatInr(totals.pending)} />
        <Stat label="आज मिला" value={formatInr(totals.todayGot)} />
      </dl>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm text-muted">अभी कोई एंट्री नहीं।</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-sm border border-border bg-bg p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{entry.pn || entry.pa}</p>
                  <p className="truncate text-sm text-muted">{entry.pa}</p>
                  <p className="text-sm text-muted">
                    {entry.appName}
                    {entry.note ? ` · ${entry.note}` : ""}
                    {" · "}
                    {formatWhen(entry.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatInr(entry.amount)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={entry.status === "received"}
                  onClick={() => onToggle(entry.id)}
                >
                  {entry.status === "received" ? "मिला" : "बाकी"}
                </Button>
                <Button type="button" variant="outline" onClick={() => onRemove(entry.id)}>
                  हटाएँ
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-sm border border-border bg-bg px-3 py-2")}>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function formatWhen(time: number): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(time);
}
