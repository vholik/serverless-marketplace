import { eq, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { and } from "drizzle-orm";
import { categoriesTable } from "~/server/db/schema";

import { createTransaction, useTransaction } from "~/server/db/transaction";
import type { ProductTypes } from "./types";
import { slugify } from "~/server/utils/slug";

export const getCategoryFromID = async (id: number) => {
  return await useTransaction(async (tx) => {
    const category = await tx.query.categoriesTable.findFirst({
      where: and(eq(categoriesTable.id, id), isNull(categoriesTable.deletedAt)),
    });

    if (!category) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Category with ID ${id} not found`,
      });
    }

    return category;
  });
};

export const createCategory = async (input: ProductTypes.CreateCategoryDTO) => {
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
};

export const updateCategory = async (input: ProductTypes.UpdateCategoryDTO) => {
  const { id, ...rest } = input;
  return await createTransaction(async (tx) => {
    await tx
      .update(categoriesTable)
      .set(rest)
      .where(eq(categoriesTable.id, id));
  });
};

export const removeCategory = async (id: number) => {
  return await createTransaction(async (tx) => {
    await tx
      .update(categoriesTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(categoriesTable.id, id));
  });
};

export const listCategories = async () => {
  return await useTransaction(async (tx) => {
    return await tx.query.categoriesTable.findMany({
      where: isNull(categoriesTable.deletedAt),
    });
  });
};
