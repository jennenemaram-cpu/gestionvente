"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductActions({
  id,
  name,
  active,
}: {
  id: number;
  name: string;
  active: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function remove() {
    if (!confirm(`Supprimer « ${name} » ?`)) return;
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMessage(json.error ?? "Erreur");
      return;
    }
    if (json.deactivated) setMessage(json.message);
    router.refresh();
  }

  async function reactivate() {
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json.error ?? "Erreur");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-2">
        {!active && (
          <button
            onClick={reactivate}
            disabled={busy}
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            Réactiver
          </button>
        )}
        <button
          onClick={remove}
          disabled={busy}
          className="rounded bg-red-600 px-2 py-1 text-sm text-white disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>
      {message && <p className="text-xs text-orange-600">{message}</p>}
    </div>
  );
}