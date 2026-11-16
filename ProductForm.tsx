"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: number; name: string };

export default function ProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setMessage("");
    setLoading(true);
    const data = Object.fromEntries(new FormData(form));
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setIsError(true);
      setMessage(json.error ?? "Une erreur est survenue");
      return;
    }
    setIsError(false);
    setMessage(`Produit ajouté : ${json.name}`);
    form.reset();
    router.refresh();
  }

  const cls = "w-full rounded border p-2";
  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded border p-4 sm:grid-cols-2">
      <h2 className="font-semibold sm:col-span-2">Ajouter un produit</h2>
      <input name="name" placeholder="Nom du produit" required className={cls} />
      <select name="categoryId" required defaultValue="" className={cls}>
        <option value="" disabled>
          Catégorie
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input name="price" type="number" step="0.01" min="0" placeholder="Prix" required className={cls} />
      <input name="stock" type="number" step="1" min="0" placeholder="Stock initial" required className={cls} />
      <input name="description" placeholder="Description (facultatif)" className={`${cls} sm:col-span-2`} />
      {message && (
        <p className={`sm:col-span-2 ${isError ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
      <button
        disabled={loading}
        className="rounded bg-blue-600 p-2 text-white disabled:opacity-50 sm:col-span-2"
      >
        {loading ? "Ajout..." : "Ajouter le produit"}
      </button>
    </form>
  );
}