import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CreateCategorySchema } from "./validators";
import { sdk } from "~/server/core";

export const productCategoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreateCategorySchema)
    .mutation(async ({ input }) => {
      const result = await sdk.category.create({ name: input.name });

      return await sdk.category.retrieve(result.id);
    }),
  remove: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await sdk.category.delete(input.id);
    }),
  list: publicProcedure.query(async () => {
    return await sdk.category.list();
  }),
});
