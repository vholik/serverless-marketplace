import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CreateTagSchema } from "./validators";
import { sdk } from "~/server/core";

export const productTagRouter = createTRPCRouter({
  create: publicProcedure.input(CreateTagSchema).mutation(async ({ input }) => {
    const result = await sdk.tag.create({ value: input.value });

    return await sdk.tag.retrieve(result.id);
  }),
  list: publicProcedure.query(async () => {
    return await sdk.tag.list();
  }),
});
