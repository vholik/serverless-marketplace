import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Product } from "~/server/core/product";

export const productMaterialRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async ({ input }) => {
      const result = await Product.createMaterial({ value: input.value });

      return await Product.getMaterialFromID(result.id);
    }),
  list: publicProcedure.query(async () => {
    return await Product.listMaterials();
  }),
});
