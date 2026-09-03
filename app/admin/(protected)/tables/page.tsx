"use client";

import { useState, useRef, forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RESTAURANT_CONFIG } from "@/lib/config";
import toast from "react-hot-toast";
import type { RestaurantTable } from "@/types";

// ── Constants ──────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const DEFAULT_TABLE_COUNT = 8;

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeDefaultTables(count: number): RestaurantTable[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    label: `Table ${i + 1}`,
    capacity: 4,
    active: true,
  }));
}

function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

// ── Shared font stack (used in the card so html2canvas picks it up) ────────────

const CARD_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ── QrCard — single source of truth for both preview and download ──────────────
//
//  Uses ONLY inline styles so html2canvas can read every property without
//  needing to resolve Tailwind classes from computed stylesheets.

const QrCard = forwardRef<
  HTMLDivElement,
  { table: RestaurantTable; qrDataUrl: string; scale?: number }
>(function QrCard({ table, qrDataUrl, scale = 1 }, ref) {
  const s = scale; // multiply every px value by this factor for the hidden copy

  return (
    <div
      ref={ref}
      style={{
        width: 380 * s,
        background: "#11100e",
        borderRadius: 32 * s,
        padding: 1 * s,
        fontFamily: CARD_FONT,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Gradient inner shell */}
      <div
        style={{
          borderRadius: 31 * s,
          background: "linear-gradient(to bottom, #27231d 0%, #0d0c0b 100%)",
          padding: 20 * s,
        }}
      >
        {/* ── Top: restaurant name + tagline ── */}
        <div style={{ textAlign: "center", paddingTop: 12 * s, paddingBottom: 20 * s }}>
          <p
            style={{
              margin: 0,
              fontSize: 22 * s,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            {RESTAURANT_CONFIG.name}
          </p>
          <p
            style={{
              marginTop: 6 * s,
              fontSize: 12 * s,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.4,
            }}
          >
            {RESTAURANT_CONFIG.tagline}
          </p>
        </div>

        {/* ── Cream QR panel ── */}
        <div
          style={{
            borderRadius: 24 * s,
            background: "#f7f5ef",
            padding: 20 * s,
            boxShadow: `0 ${20 * s}px ${60 * s}px rgba(0,0,0,0.35)`,
          }}
        >
          {/* Table label */}
          <div style={{ textAlign: "center", marginBottom: 16 * s }}>
            <p
              style={{
                margin: 0,
                fontSize: 24 * s,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#78716c",
                letterSpacing: "0.04em",
              }}
            >
              Table {padTwo(table.number)}
            </p>
          </div>

          {/* QR image */}
          <div
            style={{
              margin: "0 auto",
              width: 220 * s,
              height: 220 * s,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 16 * s,
              background: "#ffffff",
              padding: 10 * s,
              boxSizing: "border-box",
              boxShadow: `0 1px ${4 * s}px rgba(0,0,0,0.08)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="QR Code"
              style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }}
            />
          </div>

          {/* Scan to Order */}
          <div style={{ textAlign: "center", marginTop: 20 * s }}>
            <p
              style={{
                margin: 0,
                fontSize: 18 * s,
                fontWeight: 700,
                color: "#1c1917",
                letterSpacing: "-0.01em",
              }}
            >
              Scan to Order
            </p>
          </div>

          {/* Scan · Order · Enjoy pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 14 * s,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8 * s,
                borderRadius: 999,
                border: "1px solid rgba(251,191,36,0.25)",
                background: "rgba(251,191,36,0.1)",
                padding: `${6 * s}px ${16 * s}px`,
              }}
            >
              {(["Scan", "Order", "Enjoy"] as const).map((label, i) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 8 * s }}>
                  {i > 0 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 6 * s,
                        height: 6 * s,
                        borderRadius: "50%",
                        background: "#fbbf24",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: 10 * s,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.22em",
                      color: "#fcd34d",
                    }}
                  >
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom strip ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8 * s,
            paddingTop: 18 * s,
            paddingBottom: 10 * s,
          }}
        >
          <StarIcon size={14 * s} />
          <p
            style={{
              margin: 0,
              fontSize: 12 * s,
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.38)",
            }}
          >
            No app required · Quick &amp; easy ordering
          </p>
          <StarIcon size={14 * s} />
        </div>
      </div>
    </div>
  );
});

function StarIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="#fcd34d" />
    </svg>
  );
}

// ── QR placeholder shown on admin table cards ──────────────────────────────────

function QrPlaceholder() {
  return (
    <div
      className="mt-4 flex items-center justify-center rounded-lg py-6"
      style={{ border: "1px dashed var(--admin-border-strong)", background: "var(--admin-bg)" }}
    >
      <div className="grid grid-cols-3 gap-0.5 opacity-25">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-3 w-3 rounded-sm", [0, 2, 4, 6, 8].includes(i) ? "opacity-100" : "opacity-40")}
            style={{ background: "var(--admin-text-secondary)" }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────

function Spinner({ cls = "h-8 w-8" }: { cls?: string }) {
  return (
    <svg className={cn(cls, "animate-spin")} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const [tables, setTables]           = useState<RestaurantTable[]>(() => makeDefaultTables(DEFAULT_TABLE_COUNT));
  const [newCount, setNewCount]       = useState("");
  const [qrTable, setQrTable]         = useState<RestaurantTable | null>(null);
  const [qrDataUrl, setQrDataUrl]     = useState<string>("");
  const [loadingQr, setLoadingQr]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  // This ref points to the hidden 3× scale copy that html2canvas captures
  const printCardRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (qrTable) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [qrTable]);

  // ── Table management ──

  function addTables() {
    const count = parseInt(newCount, 10);
    if (!count || count < 1 || count > 50) return toast.error("Enter a valid number (1–50)");
    const lastNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0;
    const created: RestaurantTable[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      number: lastNum + i + 1,
      label: `Table ${lastNum + i + 1}`,
      capacity: 4,
      active: true,
    }));
    setTables((prev) => [...prev, ...created]);
    setNewCount("");
    toast.success(`${count} table${count > 1 ? "s" : ""} added`);
  }

  function deleteTable(id: number) {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (qrTable?.id === id) closeModal();
    toast.success("Table removed");
  }

  // ── QR generation ──

  async function openQr(table: RestaurantTable) {
    setQrTable(table);
    setQrDataUrl("");
    setLoadingQr(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(`${APP_URL}/?table=${table.number}`, {
        width: 500,
        margin: 1,
        color: { dark: "#1c1917", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
    } catch {
      toast.error("Failed to generate QR code");
    } finally {
      setLoadingQr(false);
    }
  }

  // ── Download ──
  // html2canvas captures the hidden <QrCard scale={3} /> — which is identical
  // in structure and inline-style values to the modal preview, just 3× larger.

  async function downloadQr() {
    if (!qrDataUrl || !qrTable || !printCardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(printCardRef.current, {
        scale: 3,           // 3× upscale at capture time — ~1140px wide output
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#11100e",
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
      });
      const link = document.createElement("a");
      link.download = `qr-table-${qrTable.number}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success(`Downloaded qr-table-${qrTable.number}.png`);
    } catch {
      // Fallback — raw QR dataUrl
      const link = document.createElement("a");
      link.download = `qr-table-${qrTable.number}.png`;
      link.href = qrDataUrl;
      link.click();
      toast.success(`Downloaded qr-table-${qrTable.number}.png`);
    } finally {
      setDownloading(false);
    }
  }

  function closeModal() {
    setQrTable(null);
    setQrDataUrl("");
  }

  return (
    <div className="px-4 pt-24 pb-6 sm:pt-6 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            Tables &amp; QR Codes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            {tables.length} tables · generate and download printable QR cards
          </p>
        </div>

        {/* Add tables */}
        <div className="flex items-center gap-2">
          <input
            type="number" min="1" max="12"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTables()}
            placeholder="Number of tables"
            className="admin-input w-[160px]"
          />
          <button
            onClick={addTables}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.99]"
            style={{ background: "var(--admin-accent)" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
      </div>

      {/* ── Info strip ── */}
      <div
        className="mb-5 flex items-center gap-3 rounded-xl px-5 py-3.5"
        style={{
          background: "var(--admin-info-bg)",
          border: "1px solid var(--admin-info-border)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4.5 w-4.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          style={{ color: "var(--admin-info)" }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>
          QR codes link to{" "}
          <span className="font-mono font-semibold" style={{ color: "var(--admin-text-primary)" }}>
            {APP_URL}/?table=N
          </span>
          . Print and place them on each table.
        </p>
      </div>

      {/* Table grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-2.5">
        {tables.map((table) => (
          <div
            key={table.id}
            className="group rounded-xl p-4 transition"
            style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)" }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>
                  Table {table.number}
                </p>
              </div>

              {/* Delete — visible on hover */}
              <button
                onClick={() => deleteTable(table.id)}
                title="Remove table"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-0 transition group-hover:opacity-100"
                style={{ border: "1px solid var(--admin-border)", color: "var(--admin-text-muted)", background: "var(--admin-bg)" }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            <QrPlaceholder />

            <button
              onClick={() => openQr(table)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition hover:opacity-80"
              style={{ border: "1px solid var(--admin-border-strong)", color: "var(--admin-accent)", background: "var(--admin-accent-light)" }}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
              </svg>
              View QR
            </button>
          </div>
        ))}
      </div>

      {/* ── QR Modal ── */}
      {qrTable && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={closeModal}
        >
          {/* Scroll container — centres on tall viewports, scrolls on short ones */}
          <div className="flex min-h-full items-center justify-center px-4 py-6">
          <div
            className="flex w-full max-w-[350px] flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Table {qrTable.number} — QR Card</h3>
                <p className="mt-0.5 text-xs text-white/45">Preview · download as high-res PNG</p>
              </div>
              <button
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview — scale=1 (normal size for display) */}
            {loadingQr ? (
              <div className="flex h-64 items-center justify-center rounded-3xl bg-[#11100e]">
                <Spinner cls="h-8 w-8" />
              </div>
            ) : qrDataUrl ? (
              <QrCard table={qrTable} qrDataUrl={qrDataUrl} scale={0.9} />
            ) : null}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl py-3 text-sm font-medium text-white/55 transition hover:bg-white/10 hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                Close
              </button>
              <button
                onClick={downloadQr}
                disabled={!qrDataUrl || loadingQr || downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--admin-accent)" }}
              >
                {downloading ? (
                  <><Spinner cls="h-4 w-4" />Preparing…</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PNG
                  </>
                )}
              </button>
            </div>{/* actions */}
          </div>{/* inner card */}
          </div>{/* scroll container */}
        </div>
      )}{/* modal */}

      {/* ── Hidden high-res capture target ── */}
      {/* opacity:0 keeps it invisible to users but fully painted for html2canvas */}
      {qrTable && qrDataUrl && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: -1,
            pointerEvents: "none",
            opacity: 0,
          }}
        >
          <QrCard
            ref={printCardRef}
            table={qrTable}
            qrDataUrl={qrDataUrl}
            scale={1}
          />
        </div>
      )}
    </div>
  );
}
