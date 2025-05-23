import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sdk } from "~/server/core";
import { CreateProductSchema } from "./validators";

export const productRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreateProductSchema)
    .mutation(async ({ input }) => {
      const result = await sdk.product.create(input);

      const product = await sdk.product.retrieve(result.id);

      return product;
    }),
  fromID: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const product = await sdk.product.retrieve(input.id);
      return product;
    }),
  remove: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await sdk.product.delete(input.id);
    }),
  list: publicProcedure.query(async () => {
    const products = await sdk.product.list();
    return products;
  }),
});
