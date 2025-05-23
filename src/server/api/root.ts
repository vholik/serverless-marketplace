import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { productRouter } from "./routers/product";
import { productCategoryRouter } from "./routers/product-category";
import { productMaterialRouter } from "./routers/product-material";
import { productTagRouter } from "./routers/product-tag";

export const appRouter = createTRPCRouter({
  product: productRouter,
  productCategory: productCategoryRouter,
  productMaterial: productMaterialRouter,
  productTag: productTagRouter,
});

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
