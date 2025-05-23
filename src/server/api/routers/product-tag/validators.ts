import { z } from "zod";

export const CreateTagSchema = z.object({
  value: z.string().min(1),
});
