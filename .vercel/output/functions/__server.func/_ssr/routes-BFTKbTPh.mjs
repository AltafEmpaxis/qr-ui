import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, r as Slot, t as Label$1 } from "../_libs/@radix-ui/react-label+[...].mjs";
import { n as Download, r as Copy } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BFTKbTPh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium disabled:pointer-events-none disabled:opacity-40", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			outline: "border border-border-strong bg-transparent text-fg hover:bg-surface-2"
		},
		size: { default: "h-11 px-4" }
	},
	defaultVariants: {
		variant: "primary",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-sm border border-border bg-bg px-3 text-base text-fg", "placeholder:text-subtle", "disabled:opacity-40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label$1, {
		className: cn("text-sm font-medium text-fg", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("max-h-48 min-h-28 w-full resize-y rounded-sm border border-border bg-bg px-3 py-3 text-base text-fg", "placeholder:text-subtle", className),
		...props
	});
}
var PAY_APPS = [
	{
		id: "any",
		name: "सभी UPI ऐप",
		prefix: "upi://pay"
	},
	{
		id: "gpay",
		name: "Google Pay",
		prefix: "tez://upi/pay"
	},
	{
		id: "phonepe",
		name: "PhonePe",
		prefix: "phonepe://pay"
	},
	{
		id: "paytm",
		name: "Paytm",
		prefix: "paytmmp://pay"
	},
	{
		id: "bhim",
		name: "BHIM",
		prefix: "bhim://upi/pay"
	},
	{
		id: "bharatpe",
		name: "BharatPe",
		prefix: "upi://pay"
	},
	{
		id: "amazonpay",
		name: "Amazon Pay",
		prefix: "amazonpay://upi/pay"
	},
	{
		id: "cred",
		name: "CRED",
		prefix: "credpay://upi/pay"
	}
];
var QUICK_AMOUNTS = [
	50,
	100,
	200,
	500,
	1e3,
	2e3
];
var VPA = /^[a-z0-9][a-z0-9._-]{1,49}@[a-z][a-z0-9]{1,30}$/;
var AMOUNT_MAX = 1e5;
var UPI_STORAGE_KEY = "qr-maker-upi-v1";
var LEDGER_KEY = "qr-maker-ledger-v1";
var LEDGER_LIMIT = 80;
var EMPTY_DRAFT = {
	pa: "",
	pn: "",
	amount: "",
	note: "",
	ref: "",
	appId: "any"
};
function payApp(id) {
	return PAY_APPS.find((app) => app.id === id) ?? PAY_APPS[0];
}
function formatInr(amount) {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		minimumFractionDigits: 2
	}).format(amount);
}
function enc(value) {
	return encodeURIComponent(value);
}
function parseAmount(raw) {
	const cleaned = raw.trim().replace(/,/g, "");
	if (!cleaned || !/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
	const value = Number(cleaned);
	if (!Number.isFinite(value) || value <= 0 || value > AMOUNT_MAX) return null;
	return Math.round(value * 100) / 100;
}
function normalizeVpa(raw) {
	const vpa = raw.trim().toLowerCase().replace(/\s+/g, "");
	if (!VPA.test(vpa)) return null;
	return vpa;
}
function query(fields) {
	const parts = [
		`pa=${enc(fields.pa)}`,
		`pn=${enc(fields.pn)}`,
		`am=${enc(fields.amount)}`,
		"cu=INR"
	];
	if (fields.note) parts.push(`tn=${enc(fields.note)}`);
	if (fields.ref) parts.push(`tr=${enc(fields.ref)}`);
	return parts.join("&");
}
function describePayment(draft) {
	const paRaw = draft.pa.trim();
	const pn = draft.pn.trim().replace(/\s+/g, " ").slice(0, 50);
	const amountRaw = draft.amount.trim();
	const note = draft.note.trim().replace(/\s+/g, " ").slice(0, 80);
	const ref = draft.ref.trim().replace(/[^a-zA-Z0-9-]/g, "").slice(0, 35);
	if (!(paRaw || pn || amountRaw || note || ref)) return {
		summary: null,
		error: null,
		hint: "UPI ID, नाम और राशि डालें।"
	};
	const pa = normalizeVpa(paRaw);
	if (!pa) return {
		summary: null,
		error: "UPI ID ऐसा हो: name@okaxis, name@ybl या name@paytm।",
		hint: null
	};
	if (pn.length < 2) return {
		summary: null,
		error: "पैसे पाने वाले का नाम डालें।",
		hint: null
	};
	const amount = parseAmount(amountRaw);
	if (amount === null) return {
		summary: null,
		error: "राशि 0 से बड़ी और ₹1,00,000 तक डालें। पैसे दो दशमलव तक।",
		hint: null
	};
	const app = payApp(draft.appId);
	const qs = query({
		pa,
		pn,
		amount: amount.toFixed(2),
		note,
		ref
	});
	return {
		summary: {
			link: `upi://pay?${qs}`,
			appUrl: `${app.prefix}?${qs}`,
			appId: app.id,
			appName: app.name,
			pa,
			pn,
			amount,
			amountLabel: formatInr(amount),
			note,
			ref
		},
		error: null,
		hint: null
	};
}
function loadUpiState() {
	try {
		const raw = localStorage.getItem(UPI_STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		const appId = payApp(typeof data.appId === "string" ? data.appId : "any").id;
		return {
			mode: data.mode === "text" ? "text" : "pay",
			draft: {
				pa: typeof data.pa === "string" ? data.pa.slice(0, 80) : "",
				pn: typeof data.pn === "string" ? data.pn.slice(0, 50) : "",
				amount: typeof data.amount === "string" ? data.amount.slice(0, 12) : "",
				note: typeof data.note === "string" ? data.note.slice(0, 80) : "",
				ref: typeof data.ref === "string" ? data.ref.slice(0, 35) : "",
				appId
			}
		};
	} catch {
		return null;
	}
}
function saveUpiState(draft, mode) {
	try {
		localStorage.setItem(UPI_STORAGE_KEY, JSON.stringify({
			...draft,
			mode
		}));
	} catch {}
}
function loadLedger() {
	try {
		const raw = localStorage.getItem(LEDGER_KEY);
		if (!raw) return [];
		const data = JSON.parse(raw);
		if (!Array.isArray(data)) return [];
		return data.flatMap((item) => {
			if (!item || typeof item !== "object") return [];
			const row = item;
			if (typeof row.id !== "string" || typeof row.pa !== "string" || typeof row.amount !== "number") return [];
			const status = row.status === "received" ? "received" : "pending";
			return [{
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
				status
			}];
		});
	} catch {
		return [];
	}
}
function saveLedger(entries) {
	try {
		localStorage.setItem(LEDGER_KEY, JSON.stringify(entries.slice(0, LEDGER_LIMIT)));
	} catch {}
}
function ledgerTotals(entries) {
	const start = /* @__PURE__ */ new Date();
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
			if ((entry.receivedAt ?? entry.createdAt) >= today) todayGot += entry.amount;
		} else pending += entry.amount;
	}
	return {
		asked,
		got,
		pending,
		todayGot
	};
}
function entryFromSummary(summary) {
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
		status: "pending"
	};
}
function useUpiDesk() {
	const [draft, setDraft] = (0, import_react.useState)(EMPTY_DRAFT);
	const [mode, setMode] = (0, import_react.useState)("pay");
	const [ready, setReady] = (0, import_react.useState)(false);
	const [entries, setEntries] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const saved = loadUpiState();
		if (saved) {
			setDraft(saved.draft);
			setMode(saved.mode);
		}
		setEntries(loadLedger());
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveUpiState(draft, mode);
	}, [
		ready,
		draft,
		mode
	]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveLedger(entries);
	}, [ready, entries]);
	const payment = describePayment(draft);
	function patch(partial) {
		setDraft((current) => ({
			...current,
			...partial
		}));
	}
	function addEntry(summary) {
		setEntries((current) => [entryFromSummary(summary), ...current].slice(0, 80));
	}
	function toggleEntry(id) {
		setEntries((current) => current.map((entry) => {
			if (entry.id !== id) return entry;
			const received = entry.status !== "received";
			return {
				...entry,
				status: received ? "received" : "pending",
				receivedAt: received ? Date.now() : null
			};
		}));
	}
	function removeEntry(id) {
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
		totals: ledgerTotals(entries)
	};
}
function UpiFields({ draft, patch }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 pb-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "upi-id",
					children: "UPI ID"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "upi-id",
					value: draft.pa,
					onChange: (event) => patch({ pa: event.target.value }),
					placeholder: "name@okaxis",
					autoCapitalize: "none",
					autoCorrect: "off",
					spellCheck: false,
					inputMode: "email"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "payee-name",
					children: "नाम"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "payee-name",
					value: draft.pn,
					onChange: (event) => patch({ pn: event.target.value }),
					placeholder: "पैसे किसके खाते में जाएँ",
					autoComplete: "name",
					maxLength: 50
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pay-amount",
						children: "राशि"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							"aria-hidden": "true",
							children: "₹"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pay-amount",
							value: draft.amount,
							onChange: (event) => patch({ amount: event.target.value }),
							placeholder: "100",
							inputMode: "decimal",
							autoComplete: "off",
							className: "tabular-nums"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						role: "group",
						"aria-label": "जल्दी राशि",
						children: QUICK_AMOUNTS.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							"aria-pressed": draft.amount === String(value),
							onClick: () => patch({ amount: String(value) }),
							children: ["₹", value]
						}, value))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pay-note",
						children: "नोट"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pay-note",
						value: draft.note,
						onChange: (event) => patch({ note: event.target.value }),
						placeholder: "किराया, बिल, दोस्त",
						maxLength: 80
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "pay-ref",
						children: "रिफरेंस"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "pay-ref",
						value: draft.ref,
						onChange: (event) => patch({ ref: event.target.value }),
						placeholder: "वैकल्पिक",
						autoCapitalize: "none",
						spellCheck: false,
						maxLength: 35
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						id: "pay-app-label",
						children: "किस ऐप से पेमेंट"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
						role: "group",
						"aria-labelledby": "pay-app-label",
						children: PAY_APPS.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							"aria-pressed": draft.appId === app.id,
							onClick: () => patch({ appId: app.id }),
							className: "w-full",
							children: app.name
						}, app.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "QR हमेशा स्टैंडर्ड UPI लिंक है। स्कैन करते ही राशि भरी पेमेंट स्क्रीन खुलती है, Google Pay, PhonePe, Paytm, BHIM या बैंक ऐप में। चुना हुआ ऐप नीचे वाले बटन से सीधे खुलता है।"
					})
				]
			})
		]
	});
}
function UpiLedger({ summary, entries, totals, onAdd, onToggle, onRemove }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-labelledby": "ledger-heading",
		className: "mt-4 rounded-xl border border-border bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "ledger-heading",
					className: "text-base font-semibold",
					children: "हिसाब"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "रिक्वेस्ट यहीं सेव होती है। पैसा आ जाए तो मिला मार्क करें।"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					disabled: !summary,
					onClick: () => summary && onAdd(summary),
					children: "हिसाब में जोड़ें"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "माँगा",
						value: formatInr(totals.asked)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "मिला",
						value: formatInr(totals.got)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "बाकी",
						value: formatInr(totals.pending)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "आज मिला",
						value: formatInr(totals.todayGot)
					})
				]
			}),
			entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "अभी कोई एंट्री नहीं।"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 flex flex-col gap-2",
				children: entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border bg-bg p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: entry.pn || entry.pa
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									children: entry.pa
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted",
									children: [
										entry.appName,
										entry.note ? ` · ${entry.note}` : "",
										" · ",
										formatWhen(entry.createdAt)
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tabular-nums",
							children: formatInr(entry.amount)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							"aria-pressed": entry.status === "received",
							onClick: () => onToggle(entry.id),
							children: entry.status === "received" ? "मिला" : "बाकी"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => onRemove(entry.id),
							children: "हटाएँ"
						})]
					})]
				}, entry.id))
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-sm border border-border bg-bg px-3 py-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-sm font-medium tabular-nums",
			children: value
		})]
	});
}
function formatWhen(time) {
	return new Intl.DateTimeFormat("en-IN", {
		day: "numeric",
		month: "short",
		hour: "numeric",
		minute: "2-digit"
	}).format(time);
}
var DEFAULTS = {
	text: "https://example.com",
	fg: "#111114",
	bg: "#f7f4ee",
	size: 320,
	ecc: "M"
};
var EXAMPLES = [
	{
		label: "Link",
		value: "https://example.com"
	},
	{
		label: "Note",
		value: "Meet at the north gate, 6pm"
	},
	{
		label: "Email",
		value: "mailto:hello@example.com"
	}
];
var PRESETS = [
	{
		name: "Ink",
		fg: "#111114",
		bg: "#f7f4ee"
	},
	{
		name: "Chalk",
		fg: "#f4f1ea",
		bg: "#16181d"
	},
	{
		name: "Navy",
		fg: "#10243f",
		bg: "#e7eef6"
	},
	{
		name: "Pine",
		fg: "#143028",
		bg: "#e7f0ea"
	}
];
var ECC_LEVELS = [
	{
		id: "L",
		name: "Low",
		recovery: "7%",
		hint: "Smallest code. Use when the image stays clean and sharp."
	},
	{
		id: "M",
		name: "Medium",
		recovery: "15%",
		hint: "A solid default for links and short notes."
	},
	{
		id: "Q",
		name: "Quartile",
		recovery: "25%",
		hint: "Safer if the code might get a little worn."
	},
	{
		id: "H",
		name: "High",
		recovery: "30%",
		hint: "Most recovery. Best when the print can get damaged."
	}
];
var STORAGE_KEY = "qr-maker-settings-v1";
var qrPromise = null;
function loadQr() {
	if (!qrPromise) qrPromise = import("../_libs/qrcode.mjs").then((n) => /* @__PURE__ */ __toESM(n.t())).then((mod) => {
		const named = mod;
		if (typeof named.toDataURL === "function" && typeof named.create === "function") return named;
		if (named.default && typeof named.default.toDataURL === "function" && typeof named.default.create === "function") return named.default;
		throw new Error("QR library failed to load.");
	});
	return qrPromise;
}
function renderOptions(ecc, fg, bg, width) {
	return {
		errorCorrectionLevel: ecc,
		margin: 4,
		width,
		color: {
			dark: fg,
			light: bg
		}
	};
}
function normalizeHex(raw) {
	const trimmed = raw.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(trimmed)) return null;
	return `#${trimmed.toLowerCase()}`;
}
function clampSize(value) {
	if (!Number.isFinite(value)) return 320;
	const stepped = Math.round(value / 16) * 16;
	return Math.min(768, Math.max(192, stepped));
}
function contrastRatio(a, b) {
	const hi = Math.max(relativeLuminance(a), relativeLuminance(b));
	const lo = Math.min(relativeLuminance(a), relativeLuminance(b));
	return (hi + .05) / (lo + .05);
}
function relativeLuminance(hex) {
	const n = Number.parseInt(hex.slice(1), 16);
	const channels = [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	].map((channel) => {
		const s = channel / 255;
		return s <= .03928 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
	});
	return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
}
function friendlyError(err) {
	const raw = err instanceof Error ? err.message : "";
	if (/too big/i.test(raw)) return "That text is too long for this error correction. Shorten it, or switch to L.";
	return "Could not build a QR code from this text.";
}
function loadSettings() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		const ecc = data.ecc;
		if (ecc !== "L" && ecc !== "M" && ecc !== "Q" && ecc !== "H") return null;
		const fg = typeof data.fg === "string" ? normalizeHex(data.fg) : null;
		const bg = typeof data.bg === "string" ? normalizeHex(data.bg) : null;
		if (!fg || !bg || typeof data.text !== "string") return null;
		return {
			text: data.text.slice(0, 8e3),
			fg,
			bg,
			size: clampSize(Number(data.size)),
			ecc
		};
	} catch {
		return null;
	}
}
function saveSettings(settings) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {}
}
function downloadDataUrl(dataUrl, filename) {
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
function previewAlt(text) {
	const trimmed = text.trim();
	return `QR code for ${trimmed.length > 180 ? `${trimmed.slice(0, 177)}…` : trimmed}`;
}
var PREVIEW_PX = 480;
function QrStudio() {
	const desk = useUpiDesk();
	const [text, setText] = (0, import_react.useState)(DEFAULTS.text);
	const [fg, setFg] = (0, import_react.useState)(DEFAULTS.fg);
	const [bg, setBg] = (0, import_react.useState)(DEFAULTS.bg);
	const [size, setSize] = (0, import_react.useState)(DEFAULTS.size);
	const [ecc, setEcc] = (0, import_react.useState)(DEFAULTS.ecc);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [previewFor, setPreviewFor] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	const encoded = desk.mode === "pay" ? desk.payment.summary?.link ?? "" : text;
	const paySummary = desk.mode === "pay" ? desk.payment.summary : null;
	(0, import_react.useEffect)(() => {
		const saved = loadSettings();
		if (saved) applySettings(saved, {
			setText,
			setFg,
			setBg,
			setSize,
			setEcc
		});
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		saveSettings({
			text,
			fg,
			bg,
			size,
			ecc
		});
	}, [
		hydrated,
		text,
		fg,
		bg,
		size,
		ecc
	]);
	(0, import_react.useEffect)(() => {
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
					modules: created.modules.size
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
	}, [
		hydrated,
		encoded,
		fg,
		bg,
		ecc
	]);
	(0, import_react.useEffect)(() => {
		if (!encoded.trim()) {
			setAnnouncement(desk.mode === "pay" ? "पेमेंट QR खाली है। UPI ID, नाम और राशि डालें।" : "Preview is empty. Type a link or some text.");
			return;
		}
		if (error) {
			setAnnouncement("");
			return;
		}
		if (!preview || previewFor !== encoded) return;
		const id = window.setTimeout(() => {
			setAnnouncement(desk.mode === "pay" && paySummary ? `पेमेंट QR तैयार। ${paySummary.amountLabel}, ${paySummary.pa}।` : `QR code updated. Version ${preview.version}, ${preview.modules} by ${preview.modules} modules. PNG is ${size} by ${size} pixels.`);
		}, 700);
		return () => window.clearTimeout(id);
	}, [
		encoded,
		error,
		preview,
		previewFor,
		size,
		desk.mode,
		paySummary
	]);
	const shownError = desk.mode === "pay" ? desk.payment.error ?? error : error;
	const previewReady = Boolean(preview && previewFor === encoded && encoded.trim() && !shownError);
	const canDownload = previewReady && !saving;
	async function onDownload() {
		if (!canDownload) return;
		setSaving(true);
		try {
			downloadDataUrl(await (await loadQr()).toDataURL(encoded, renderOptions(ecc, fg, bg, size)), paySummary ? `upi-${paySummary.amount.toFixed(2)}.png` : "qr-code.png");
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shell",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "#qr-preview",
				className: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-accent-fg",
				children: "Skip to preview"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-5 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/favicon.svg",
					alt: "",
					width: 36,
					height: 36,
					className: "size-9 shrink-0"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-xl font-semibold tracking-tight text-balance",
						children: "QR Maker"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-pretty text-muted",
						children: "UPI पेमेंट QR या कोई भी लिंक। स्कैन पर राशि के साथ पेमेंट स्क्रीन खुलती है।"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				"aria-live": "polite",
				children: announcement
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-label": "Settings",
					className: "order-2 rounded-xl border border-border bg-surface p-4 lg:order-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 grid grid-cols-2 gap-2",
						role: "group",
						"aria-label": "QR का प्रकार",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							"aria-pressed": desk.mode === "pay",
							onClick: () => desk.setMode("pay"),
							children: "पेमेंट"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							"aria-pressed": desk.mode === "text",
							onClick: () => desk.setMode("text"),
							children: "लिंक या टेक्स्ट"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-border",
						children: [
							desk.mode === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpiFields, {
								draft: desk.draft,
								patch: desk.patch
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 pb-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "content",
										children: "Content"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "content",
										value: text,
										onChange: (event) => setText(event.target.value),
										placeholder: "Paste a link or type a note",
										autoCapitalize: "none",
										autoCorrect: "off",
										spellCheck: false,
										maxLength: 8e3,
										"aria-describedby": "content-count"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap gap-2",
										role: "group",
										"aria-label": "Examples",
										children: EXAMPLES.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "outline",
											"aria-pressed": text === example.value,
											onClick: () => setText(example.value),
											children: example.label
										}, example.label))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										id: "content-count",
										className: "text-sm text-muted tabular-nums",
										children: [
											text.length,
											" ",
											text.length === 1 ? "character" : "characters"
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-4 py-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										id: "foreground",
										label: "Foreground",
										value: fg,
										onChange: setFg
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
										id: "background",
										label: "Background",
										value: bg,
										onChange: setBg
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-2",
									role: "group",
									"aria-label": "Color presets",
									children: PRESETS.map((preset) => {
										const selected = preset.fg === fg && preset.bg === bg;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											type: "button",
											variant: "outline",
											"aria-pressed": selected,
											onClick: () => {
												setFg(preset.fg);
												setBg(preset.bg);
											},
											className: cn("w-full", selected && "border-fg bg-fg text-accent-fg hover:bg-fg"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex",
													"aria-hidden": "true",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "swatch size-4 rounded-full",
														style: { backgroundColor: preset.fg }
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "swatch -ml-1 size-4 rounded-full",
														style: { backgroundColor: preset.bg }
													})]
												}), preset.name]
											})
										}, preset.name);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2 py-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "export-size",
											children: "PNG size"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium tabular-nums",
											children: [
												size,
												"×",
												size
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "export-size",
										className: "size-range",
										type: "range",
										min: 192,
										max: 768,
										step: 16,
										value: size,
										onChange: (event) => setSize(clampSize(Number(event.target.value))),
										"aria-valuemin": 192,
										"aria-valuemax": 768,
										"aria-valuenow": size,
										"aria-valuetext": `${size} by ${size} pixels`,
										"aria-describedby": "size-hint"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: "size-hint",
										className: "text-sm text-muted",
										children: "Pixel size of the downloaded PNG. A quiet zone is included."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
								className: "pt-5",
								"aria-describedby": "ecc-hint",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
										className: "text-sm font-medium text-fg",
										children: "Error correction"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 grid grid-cols-4 gap-2",
										children: ECC_LEVELS.map((item) => {
											const checked = item.id === ecc;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: cn("flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-sm border px-1 py-2 text-center", checked ? "border-fg bg-fg text-accent-fg" : "border-border bg-bg text-fg"),
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "radio",
														name: "error-correction",
														value: item.id,
														checked,
														onChange: () => setEcc(item.id),
														className: "sr-only"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm font-medium",
														"aria-hidden": "true",
														children: item.id
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("text-xs tabular-nums", checked ? "text-accent-fg" : "text-muted"),
														"aria-hidden": "true",
														children: item.recovery
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "sr-only",
														children: [
															item.name,
															". ",
															item.recovery,
															" recovery."
														]
													})
												]
											}, item.id);
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										id: "ecc-hint",
										className: "mt-2 text-sm text-muted",
										children: [level.hint, desk.mode === "pay" && (ecc === "L" || ecc === "M") ? " पेमेंट QR के लिए Q या H ज़्यादा सुरक्षित है।" : ""]
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: "qr-preview",
					"aria-labelledby": "preview-heading",
					className: "order-1 rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-6 lg:order-2 lg:w-80",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "preview-heading",
							className: "text-sm font-medium",
							children: "Live preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "preview-frame mx-auto mt-3 overflow-hidden rounded-sm border border-border bg-bg",
							style: { maxWidth: size },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex aspect-square w-full items-center justify-center",
								children: previewReady && preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: preview.url,
									alt: paySummary ? `UPI payment QR for ${paySummary.pn}, ${paySummary.amountLabel}` : previewAlt(encoded),
									width: PREVIEW_PX,
									height: PREVIEW_PX,
									decoding: "sync",
									className: "block h-full w-full",
									"aria-describedby": lowContrast ? "contrast-warning" : void 0
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("px-4 text-center text-sm", shownError ? "text-fg" : "text-muted"),
									role: shownError ? "alert" : void 0,
									children: shownError ?? (desk.mode === "pay" ? desk.payment.hint ?? "पेमेंट QR बन रहा है…" : encoded.trim() ? "Generating preview…" : "Type a link or some text to generate a code.")
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-col gap-2",
							children: [
								previewReady && preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-center text-sm text-muted tabular-nums",
									children: [
										"Version ",
										preview.version,
										" · ",
										preview.modules,
										"×",
										preview.modules
									]
								}) : null,
								paySummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-lg font-semibold tabular-nums",
											children: paySummary.amountLabel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted",
											children: [
												paySummary.pn,
												" · ",
												paySummary.pa
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: paySummary.appName
										})
									]
								}) : null,
								paySummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									readOnly: true,
									value: paySummary.link,
									"aria-label": "UPI लिंक",
									onFocus: (event) => event.currentTarget.select(),
									className: "font-mono"
								}) : null,
								previewReady && lowContrast ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									id: "contrast-warning",
									className: "text-center text-sm text-fg",
									children: [
										"Low contrast (",
										ratio.toFixed(1),
										":1). Scanners may not read this."
									]
								}) : null,
								paySummary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									className: "w-full",
									onClick: () => void onCopy(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
										"aria-hidden": "true",
										className: "size-4"
									}), copied ? "लिंक कॉपी हो गया" : "UPI लिंक कॉपी"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "w-full",
									variant: "outline",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: paySummary.appUrl,
										children: [paySummary.appName, " में खोलें"]
									})
								})] }) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									className: "w-full",
									disabled: !canDownload,
									"aria-busy": saving,
									onClick: () => {
										onDownload();
									},
									"aria-label": `Download PNG, ${size} by ${size} pixels`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
										"aria-hidden": "true",
										className: "size-4"
									}), saving ? "Preparing PNG…" : "Download PNG"]
								})
							]
						})
					]
				})]
			}),
			desk.mode === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpiLedger, {
				summary: desk.payment.summary,
				entries: desk.entries,
				totals: desk.totals,
				onAdd: desk.addEntry,
				onToggle: desk.toggleEntry,
				onRemove: desk.removeEntry
			}) : null
		]
	});
}
function applySettings(saved, setters) {
	setters.setText(saved.text);
	setters.setFg(saved.fg);
	setters.setBg(saved.bg);
	setters.setSize(saved.size);
	setters.setEcc(saved.ecc);
}
function ColorField({ id, label, value, onChange }) {
	const [draft, setDraft] = (0, import_react.useState)(value);
	const errorId = `${id}-error`;
	const parsed = normalizeHex(draft);
	const showInvalid = draft.trim().length >= 7 && parsed === null;
	(0, import_react.useEffect)(() => {
		setDraft(value);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				htmlFor: `${id}-hex`,
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: `${id}-picker`,
					className: "color-input",
					type: "color",
					value,
					"aria-label": `${label} picker`,
					onChange: (event) => onChange(event.target.value.toLowerCase())
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: `${id}-hex`,
					value: draft,
					"aria-label": `${label} hex`,
					"aria-invalid": showInvalid,
					"aria-describedby": showInvalid ? errorId : void 0,
					spellCheck: false,
					autoCapitalize: "off",
					autoCorrect: "off",
					maxLength: 7,
					onChange: (event) => {
						const next = event.target.value;
						setDraft(next);
						const hex = normalizeHex(next);
						if (hex) onChange(hex);
					},
					onBlur: () => {
						if (normalizeHex(draft) === null) setDraft(value);
					},
					className: cn("min-w-0 flex-1 font-mono uppercase", showInvalid && "border-fg")
				})]
			}),
			showInvalid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: errorId,
				className: "text-sm text-fg",
				role: "alert",
				children: "Use a 6-digit hex color, like #112233."
			}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrStudio, {});
}
//#endregion
export { Home as component };
