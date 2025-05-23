import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
});

export const RemoveCategorySchema = z.object({
  id: z.number(),
});
