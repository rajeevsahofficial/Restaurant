"use client";

import { useState } from "react";
import { RESTAURANT_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { RestaurantTable } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function makeDefaultTables(count: number): RestaurantTable[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    label: `Table ${i + 1}`,
    capacity: 4,
    active: true,
  }));
}

export default function TablesPage() {
  const [tables, setTables]         = useState<RestaurantTable[]>(() => makeDefaultTables(8));
  const [newCount, setNewCount]     = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const [qrTable, setQrTable]       = useState<RestaurantTable | null>(null);
  const [qrDataUrl, setQrDataUrl]   = useState<string>("");
  const [loadingQr, setLoadingQr]   = useState(false);

  async function generateQr(table: RestaurantTable) {
    setQrTable(table);
    setQrDataUrl("");
    setLoadingQr(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const url = `${APP_URL}/?table=${table.number}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: { dark: "#1f1c17", light: "#f7f5f0" },
      });
      setQrDataUrl(dataUrl);
    } catch {
      toast.error("Failed to generate QR code");
    } finally {
      setLoadingQr(false);
    }
  }

  function toggleActive(id: number) {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
    toast.success("Table status updated");
  }

  function updateCapacity(id: number, cap: number) {
    if (cap < 1 || cap > 20) return;
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, capacity: cap } : t)));
  }

  function addTables() {
    const count = parseInt(newCount, 10);
    if (!count || count < 1 || count > 50) return toast.error("Enter a valid number (1–50)");
    const lastNum = tables.length > 0 ? Math.max(...tables.map((t) => t.number)) : 0;
    const newTables: RestaurantTable[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      number: lastNum + i + 1,
      label: `Table ${lastNum + i + 1}`,
      capacity: parseInt(newCapacity, 10) || 4,
      active: true,
    }));
    setTables((prev) => [...prev, ...newTables]);
    setNewCount("");
    toast.success(`${count} table${count > 1 ? "s" : ""} added`);
  }

  function deleteTable(id: number) {
    setTables((prev) => prev.filter((t) => t.id !== id));
    toast.success("Table removed");
  }

  function downloadQr() {
    if (!qrDataUrl || !qrTable) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-table-${qrTable.number}.png`;
    a.click();
    toast.success(`QR saved as qr-table-${qrTable.number}.png`);
  }

  const activeCount = tables.filter((t) => t.active).length;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--admin-text-primary)" }}>
            Tables & QR Codes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            {activeCount} active · {tables.length} total tables
          </p>
        </div>

        {/* Add tables control */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1" max="50"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            placeholder="# tables"
            className="admin-input w-24"
          />
          <select
            value={newCapacity}
            onChange={(e) => setNewCapacity(e.target.value)}
            className="admin-input w-32"
          >
            {[2, 4, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>{n} seats</option>
            ))}
          </select>
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

      {/* ── Table grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={cn("rounded-xl p-4 transition", !table.active && "opacity-60")}
            style={{
              background: "var(--admin-card-bg)",
              border: `1px solid ${table.active ? "var(--admin-border)" : "var(--admin-border)"}`,
            }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-bold" style={{ color: "var(--admin-text-primary)" }}>
                  Table {table.number}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    style={{ color: "var(--admin-text-muted)" }}
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => updateCapacity(table.id, table.capacity - 1)}
                      className="px-1 text-xs transition hover:opacity-60"
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      −
                    </button>
                    <span className="text-xs font-medium" style={{ color: "var(--admin-text-secondary)" }}>
                      {table.capacity} seats
                    </span>
                    <button
                      onClick={() => updateCapacity(table.id, table.capacity + 1)}
                      className="px-1 text-xs transition hover:opacity-60"
                      style={{ color: "var(--admin-text-muted)" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <span
                className="mt-0.5 rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={
                  table.active
                    ? {
                        background: "var(--admin-success-bg)",
                        color: "var(--admin-success)",
                        border: "1px solid var(--admin-success-border)",
                      }
                    : {
                        background: "var(--admin-bg)",
                        color: "var(--admin-text-muted)",
                        border: "1px solid var(--admin-border)",
                      }
                }
              >
                {table.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* QR placeholder */}
            <div
              className="mt-4 flex items-center justify-center rounded-lg py-5"
              style={{
                border: "1px dashed var(--admin-border-strong)",
                background: "var(--admin-bg)",
              }}
            >
              <div className="grid grid-cols-3 gap-0.5 opacity-30">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 w-3 rounded-sm",
                      [0, 2, 4, 6, 8].includes(i) ? "opacity-100" : "opacity-50",
                    )}
                    style={{ background: "var(--admin-text-secondary)" }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => generateQr(table)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition hover:opacity-80"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-accent)",
                  background: "var(--admin-accent-light)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                  <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
                  <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
                  <path d="M14 14h2v2h-2zM18 14h3M18 18h3M14 18v3M14 20h2" />
                </svg>
                View QR
              </button>

              <button
                onClick={() => toggleActive(table.id)}
                title={table.active ? "Deactivate" : "Activate"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:opacity-80"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-muted)",
                  background: "var(--admin-bg)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </button>

              <button
                onClick={() => deleteTable(table.id)}
                title="Delete table"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:border-red-300"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-muted)",
                  background: "var(--admin-bg)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── QR Modal ── */}
      {qrTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setQrTable(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-xl"
            style={{
              background: "var(--admin-card-bg)",
              border: "1px solid var(--admin-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--admin-text-primary)" }}>
                  QR Code
                </h3>
                <p className="text-sm" style={{ color: "var(--admin-text-secondary)" }}>
                  Table {qrTable.number}
                </p>
              </div>
              <button
                onClick={() => setQrTable(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:opacity-70"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-secondary)",
                  background: "var(--admin-bg)",
                }}
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* QR area */}
            <div className="flex items-center justify-center rounded-xl p-6" style={{ background: "#f7f5f0" }}>
              {loadingQr ? (
                <div className="flex h-[200px] w-[200px] items-center justify-center">
                  <svg
                    className="h-8 w-8 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ color: "var(--admin-accent)" }}
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt={`QR Table ${qrTable.number}`} className="h-[200px] w-[200px]" />
              ) : null}
            </div>

            <p
              className="mt-3 break-all text-center font-mono text-xs"
              style={{ color: "var(--admin-text-muted)" }}
            >
              {APP_URL}/?table={qrTable.number}
            </p>

            {/* Modal actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setQrTable(null)}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium transition hover:opacity-80"
                style={{
                  border: "1px solid var(--admin-border-strong)",
                  color: "var(--admin-text-secondary)",
                  background: "var(--admin-card-bg)",
                }}
              >
                Close
              </button>
              <button
                onClick={downloadQr}
                disabled={!qrDataUrl || loadingQr}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ background: "var(--admin-accent)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
