import { eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { and } from "drizzle-orm";
import { categoriesTable } from "~/server/db/schema";

import { createTransaction, useTransaction } from "~/server/db/transaction";
import { slugify } from "~/server/utils/slug";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "./types";

export class ProductCategory {
  async retrieve(id: number) {
    return await useTransaction(async (tx) => {
      const category = await tx.query.categoriesTable.findFirst({
        where: and(
          eq(categoriesTable.id, id),
          isNull(categoriesTable.deletedAt),
        ),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Category with ID ${id} not found`,
        });
      }

      return category;
    });
  }

  async create(input: CreateCategoryDTO) {
    return await createTransaction(async (tx) => {
      const [createdCategory] = await tx
        .insert(categoriesTable)
        .values({
          ...input,
          slug: input.slug ?? slugify(input.name),
        })
        .returning({ id: categoriesTable.id });

      return createdCategory!;
    });
  }

  async update(input: UpdateCategoryDTO) {
    const { id, ...rest } = input;
    return await createTransaction(async (tx) => {
      await tx
        .update(categoriesTable)
        .set(rest)
        .where(eq(categoriesTable.id, id));
    });
  }

  async delete(id: number) {
    return await createTransaction(async (tx) => {
      await tx
        .update(categoriesTable)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(categoriesTable.id, id));
    });
  }

  async list() {
    return await useTransaction(async (tx) => {
      return await tx.query.categoriesTable.findMany({
        where: isNull(categoriesTable.deletedAt),
      });
    });
  }
}
