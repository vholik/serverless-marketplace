import { eq, isNull } from "drizzle-orm";
import { productMaterialsTable } from "~/server/db/schema";
import { createTransaction, useTransaction } from "~/server/db/transaction";
import type { ProductTypes } from "./types";
import { TRPCError } from "@trpc/server";

export const listMaterials = async () => {
  return await useTransaction(async (tx) => {
    const materials = await tx.query.productMaterialsTable.findMany({
      where: isNull(productMaterialsTable.deletedAt),
    });

    return materials;
  });
};

export const createMaterial = async (input: ProductTypes.CreateMaterialDTO) => {
  return await createTransaction(async (tx) => {
    const [createdMaterial] = await tx
      .insert(productMaterialsTable)
      .values({
        value: input.value,
      })
      .returning({ id: productMaterialsTable.id });

    return createdMaterial!;
  });
};

export const getMaterialFromID = async (id: number) => {
  return await useTransaction(async (tx) => {
    const material = await tx.query.productMaterialsTable.findFirst({
      where: eq(productMaterialsTable.id, id),
    });

    if (!material) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Material with ID ${id} not found`,
      });
    }

    return material;
  });
};
