import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/guard";
import { stockSchema } from "@/lib/product-validation";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Remplace la quantité en stock : { "stock": 42 }
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await requireAdminApi();
  if (g.error) return g.error;

  const id = parseId((await params).id);
  if (!id) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = stockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { stock: parsed.data.stock },
    select: { id: true, name: true, stock: true },
  });
  return NextResponse.json(product);
}
