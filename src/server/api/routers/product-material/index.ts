import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sdk } from "~/server/core";
import { CreateMaterialSchema } from "./validators";

export const productMaterialRouter = createTRPCRouter({
  create: publicProcedure
    .input(CreateMaterialSchema)
    .mutation(async ({ input }) => {
      const result = await sdk.material.create({ value: input.value });

      return await sdk.material.retrieve(result.id);
    }),
  list: publicProcedure.query(async () => {
    return await sdk.material.list();
  }),
});
