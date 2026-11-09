import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nom : 2 caractères minimum"),
  description: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  stock: z.coerce
    .number()
    .int("Le stock doit être un entier")
    .min(0, "Le stock ne peut pas être négatif"),
  categoryId: z.coerce.number().int("Catégorie invalide").positive("Catégorie invalide"),
});

export const activeSchema = z.object({
  active: z.boolean(),
});

export const stockSchema = z.object({
  stock: z
    .number()
    .int("Le stock doit être un entier")
    .min(0, "Le stock ne peut pas être négatif")
    .max(1000000, "Quantité trop grande"),
});