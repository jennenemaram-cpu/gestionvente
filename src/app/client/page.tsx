import { requireRole } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function ClientPage() {
  const user = await requireRole("CLIENT");
  return (
    <main className="mx-auto max-w-md space-y-3 px-4 pt-24">
      <h1 className="text-2xl font-bold">Bonjour {user.name} !</h1>
      <p>Email : {user.email}</p>
      <p>Membre depuis le {user.createdAt.toLocaleDateString("fr-FR")}</p>
      <LogoutButton />
    </main>
  );
}