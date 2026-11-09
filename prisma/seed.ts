import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@exemple.com"; // à changer si tu veux
  const password = "ChangeMoi123!"; // à changer si tu veux

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

  console.log("Admin créé :", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());