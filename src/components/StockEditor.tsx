"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockEditor({
  id,
  stock,
}: {
  id: number;
  stock: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(stock));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const unchanged = value === String(stock);
  const empty = value.trim() === "";

  async function save() {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Number(value) }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setIsError(true);
      setMessage(json.error ?? "Erreur");
      return;
    }
    setIsError(false);
    setMessage("Enregistré");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-24 rounded border p-1"
        />
        <button
          onClick={save}
          disabled={busy || unchanged || empty}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {busy ? "..." : "Enregistrer"}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
