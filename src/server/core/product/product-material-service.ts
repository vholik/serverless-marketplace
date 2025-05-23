import { eq, isNull } from "drizzle-orm";
import { productMaterialsTable } from "~/server/db/schema";
import { createTransaction, useTransaction } from "~/server/db/transaction";
import { TRPCError } from "@trpc/server";
import type { CreateMaterialDTO } from "./types";

export class ProductMaterial {
  async list() {
    return await useTransaction(async (tx) => {
      const materials = await tx.query.productMaterialsTable.findMany({
        where: isNull(productMaterialsTable.deletedAt),
      });

      return materials;
    });
  }

  async create(input: CreateMaterialDTO) {
    return await createTransaction(async (tx) => {
      const [createdMaterial] = await tx
        .insert(productMaterialsTable)
        .values({
          value: input.value,
        })
        .returning({ id: productMaterialsTable.id });

      return createdMaterial!;
    });
  }

  async retrieve(id: number) {
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
  }
}
