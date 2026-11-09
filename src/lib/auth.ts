import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function requireRole(role: "ADMIN" | "CLIENT") {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login");
  if (user.role !== role) {
    redirect(user.role === "ADMIN" ? "/admin" : "/client");
  }
  return user;
}