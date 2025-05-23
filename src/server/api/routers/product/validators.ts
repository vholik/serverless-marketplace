import { z } from "zod";

const IdAssociation = z.object({
  id: z.number(),
});

export const CreateProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).optional(),
  subtitle: z.string().min(1).nullable().optional(),
  description: z.string().min(1).nullable().optional(),
  depth: z.number().min(0).nullable().optional(),
  height: z.number().min(0).nullable().optional(),
  width: z.number().min(0).nullable().optional(),
  weight: z.number().min(0).nullable().optional(),
  originCountry: z.string().min(1).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  images: z.array(z.string().url()).optional(),
  options: z
    .array(
      z.object({
        name: z.string().min(1),
        values: z.array(z.string().min(1)),
      }),
    )
    .optional(),
  tags: z.array(IdAssociation).optional(),
  materials: z.array(IdAssociation).optional(),
  categories: z.array(IdAssociation).optional(),
  variants: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1).nullable().optional(),
        sku: z.string().min(1).nullable().optional(),
        quantity: z.number().min(0).optional(),
        manageStock: z.boolean().default(true).optional(),
        options: z.record(z.string(), z.string()),
      }),
    )
    .optional(),
  // todo: add pricing and shipping options
});
