import { z } from "zod";

export const CreateMaterialSchema = z.object({
  value: z.string().min(1),
});
