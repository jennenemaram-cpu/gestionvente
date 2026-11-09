import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center gap-4 px-4 pt-24">
      <h1 className="text-2xl font-bold">Gestion commerciale</h1>
      <Link href="/login" className="text-blue-600 underline">
        Se connecter
      </Link>
      <Link href="/register" className="text-blue-600 underline">
        S'inscrire
      </Link>
    </main>
  );
}