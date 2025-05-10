import { eq, isNull } from "drizzle-orm";
import { productTagsTable } from "~/server/db/schema";
import { createTransaction, useTransaction } from "~/server/db/transaction";
import type { ProductTypes } from "./types";
import { TRPCError } from "@trpc/server";

export const listTags = async () => {
  return await useTransaction(async (tx) => {
    const tags = await tx.query.productTagsTable.findMany({
      where: isNull(productTagsTable.deletedAt),
    });

    return tags;
  });
};

export const createTag = async (input: ProductTypes.CreateTagDTO) => {
  return await createTransaction(async (tx) => {
    const [createdTag] = await tx
      .insert(productTagsTable)
      .values({
        value: input.value,
      })
      .returning({ id: productTagsTable.id });

    return createdTag!;
  });
};

export const getTagFromID = async (id: number) => {
  return await useTransaction(async (tx) => {
    const tag = await tx.query.productTagsTable.findFirst({
      where: eq(productTagsTable.id, id),
    });

    if (!tag) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Tag with ID ${id} not found`,
      });
    }

    return tag;
  });
};
