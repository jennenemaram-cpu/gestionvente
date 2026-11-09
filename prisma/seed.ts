import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin ---
  const email = "admin@exemple.com";
  const password = "ChangeMoi123!";
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Administrateur",
      email,
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  console.log("Admin OK :", email);

  // --- Nettoyage d'anciennes données de démo éventuelles (jamais commandées) ---
  const legacy = ["Informatique", "Téléphonie"];
  await prisma.product.deleteMany({
    where: { category: { name: { in: legacy } }, items: { none: {} } },
  });
  await prisma.category.deleteMany({
    where: { name: { in: legacy }, products: { none: {} } },
  });

  // --- Catégories ---
  const names = ["Accessoires", "Skin care", "Makeup"];
  for (const name of names) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  const cat = async (name: string) =>
    (await prisma.category.findUniqueOrThrow({ where: { name } })).id;

  // --- Produits (seulement si la table est vide) ---
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        // Accessoires
        { name: "Set de pinceaux maquillage", description: "10 pièces, poils synthétiques", price: 35, stock: 25, categoryId: await cat("Accessoires") },
        { name: "Trousse de maquillage", description: "Grand format, imperméable", price: 18, stock: 40, categoryId: await cat("Accessoires") },
        { name: "Miroir de poche", description: "Double face, grossissant x2", price: 12, stock: 3, categoryId: await cat("Accessoires") },
        // Skin care
        { name: "Sérum vitamine C", description: "Éclat, 30 ml", price: 60, stock: 15, categoryId: await cat("Skin care") },
        { name: "Crème hydratante visage", description: "Tous types de peaux, 50 ml", price: 45, stock: 20, categoryId: await cat("Skin care") },
        { name: "Gel nettoyant visage", description: "Doux, sans savon, 150 ml", price: 28, stock: 0, categoryId: await cat("Skin care") },
        // Makeup
        { name: "Rouge à lèvres mat", description: "Longue tenue", price: 22, stock: 30, categoryId: await cat("Makeup") },
        { name: "Fond de teint fluide", description: "Couvrance moyenne, 30 ml", price: 40, stock: 18, categoryId: await cat("Makeup") },
        { name: "Mascara volume", description: "Waterproof", price: 25, stock: 12, categoryId: await cat("Makeup") },
      ],
    });
    console.log("Produits de démonstration créés");
  } else {
    console.log("Produits déjà présents : rien à créer");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
