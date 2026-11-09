import Link from "next/link";
import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminPage() {
  const user = await requireRole("ADMIN");
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 pt-24">
      <h1 className="text-2xl font-bold">Espace Admin : {user.name}</h1>
      <p>Email : {user.email}</p>
      <p>Membre depuis le {user.createdAt.toLocaleDateString("fr-FR")}</p>
      <Link
        href="/admin/products"
        className="inline-block rounded bg-blue-600 px-3 py-2 text-white"
      >
        Gérer les produits
      </Link>
      <Link
        href="/admin/stock"
        className="inline-block rounded bg-blue-600 px-3 py-2 text-white"
      >
        Gérer le stock
      </Link>
      <div>
        <LogoutButton />
      </div>
    </main>
  );
}