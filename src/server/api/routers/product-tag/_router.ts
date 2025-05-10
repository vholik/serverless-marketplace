import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Product } from "~/server/core/product";

export const productTagRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async ({ input }) => {
      const result = await Product.createTag({ value: input.value });

      return await Product.getTagFromID(result.id);
    }),
  list: publicProcedure.query(async () => {
    return await Product.listTags();
  }),
});
