import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/guard";
import { productSchema } from "@/lib/product-validation";

export async function GET() {
  const g = await requireAdminApi();
  if (g.error) return g.error;

  const products = await prisma.product.findMany({
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const g = await requireAdminApi();
  if (g.error) return g.error;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable" }, { status: 400 });
  }

  const product = await prisma.product.create({ data });
  return NextResponse.json(product, { status: 201 });
}