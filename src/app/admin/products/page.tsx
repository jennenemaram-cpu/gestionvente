import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import ProductForm from "@/components/ProductForm";
import ProductActions from "@/components/ProductActions";

const LOW_STOCK = 5;

export default async function AdminProductsPage() {
  await requireRole("ADMIN");

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produits ({products.length})</h1>
        <Link href="/admin" className="text-blue-600 underline">
          ← Retour au tableau de bord
        </Link>
      </div>

      <ProductForm categories={categories} />

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Produit</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-t ${p.active ? "" : "bg-gray-50 text-gray-500"}`}>
                <td className="p-3">
                  <div className="font-medium">{p.name}</div>
                  {p.description && <div className="text-xs text-gray-500">{p.description}</div>}
                </td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">
                  {p.stock}{" "}
                  {p.stock === 0 ? (
                    <span className="ml-1 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">Rupture</span>
                  ) : p.stock <= LOW_STOCK ? (
                    <span className="ml-1 rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">Stock faible</span>
                  ) : null}
                </td>
                <td className="p-3">{p.active ? "Actif" : "Inactif"}</td>
                <td className="p-3">
                  <ProductActions id={p.id} name={p.name} active={p.active} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}