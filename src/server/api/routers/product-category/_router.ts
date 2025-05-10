import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Product } from "~/server/core/product";

export const productCategoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const result = await Product.createCategory({ name: input.name });

      return await Product.getCategoryFromID(result.id);
    }),
  remove: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await Product.removeCategory(input.id);
    }),
  list: publicProcedure.query(async () => {
    return await Product.listCategories();
  }),
});
