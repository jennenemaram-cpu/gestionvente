import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/guard";
import { activeSchema } from "@/lib/product-validation";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Supprime le produit s'il n'a jamais été commandé, sinon le désactive.
export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdminApi();
  if (g.error) return g.error;

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { items: true } } },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const deactivate = async () => {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({
      deleted: false,
      deactivated: true,
      message: "Produit déjà commandé : il a été désactivé au lieu d'être supprimé.",
    });
  };

  if (product._count.items > 0) return deactivate();

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ deleted: true, deactivated: false });
  } catch {
    return deactivate();
  }
}

// Active ou désactive un produit : { "active": true | false }
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdminApi();
  if (g.error) return g.error;

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = activeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champ « active » (booléen) requis" },
      { status: 400 }
    );
  }

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { active: parsed.data.active },
  });
  return NextResponse.json(product);
}