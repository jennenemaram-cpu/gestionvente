import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stockLevel } from "@/lib/stock";
import StockEditor from "@/components/StockEditor";

type Props = { searchParams: Promise<{ filter?: string }> };

export default async function AdminStockPage({ searchParams }: Props) {
  await requireRole("ADMIN");
  const { filter } = await searchParams;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
  });

  const out = products.filter((p) => stockLevel(p.stock) === "OUT");
  const low = products.filter((p) => stockLevel(p.stock) === "LOW");
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);

  const shown = filter === "out" ? out : filter === "low" ? low : products;

  const tab = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`rounded px-3 py-1 text-sm ${
        active ? "bg-blue-600 text-white" : "border"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stock</h1>
        <Link href="/admin" className="text-blue-600 underline">
          ← Retour au tableau de bord
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Produits</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-gray-500">Unités en stock</p>
          <p className="text-2xl font-bold">{totalUnits}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-orange-600">Stock faible</p>
          <p className="text-2xl font-bold">{low.length}</p>
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-red-600">Rupture</p>
          <p className="text-2xl font-bold">{out.length}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tab("/admin/stock", "Tous", !filter)}
        {tab("/admin/stock?filter=low", "Stock faible", filter === "low")}
        {tab("/admin/stock?filter=out", "Rupture", filter === "out")}
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Produit</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Stock actuel</th>
              <th className="p-3">Modifier la quantité</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => {
              const level = stockLevel(p.stock);
              return (
                <tr
                  key={p.id}
                  className={`border-t ${p.active ? "" : "bg-gray-50 text-gray-500"}`}
                >
                  <td className="p-3">
                    <div className="font-medium">{p.name}</div>
                    {!p.active && <div className="text-xs">Inactif</div>}
                  </td>
                  <td className="p-3">{p.category.name}</td>
                  <td className="p-3">
                    {p.stock}{" "}
                    {level === "OUT" && (
                      <span className="ml-1 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        Rupture
                      </span>
                    )}
                    {level === "LOW" && (
                      <span className="ml-1 rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                        Stock faible
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <StockEditor
                      key={`${p.id}-${p.stock}`}
                      id={p.id}
                      stock={p.stock}
                    />
                  </td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Aucun produit dans cette catégorie de stock.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
