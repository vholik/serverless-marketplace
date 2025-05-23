import { createTransaction, useTransaction } from "~/server/db/transaction";
import type { CreateShippingOptionDTO, UpdateShippingOptionDTO } from "./types";
import {
  shippingOptionPricesTable,
  shippingOptionsTable,
} from "~/server/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export class ShippingOption {
  async create(input: CreateShippingOptionDTO) {
    return await createTransaction(async (tx) => {
      const { prices, ...rest } = input;

      const [createdShippingOption] = await tx
        .insert(shippingOptionsTable)
        .values(rest)
        .returning({ id: shippingOptionsTable.id });

      await tx.insert(shippingOptionPricesTable).values(
        prices.map((price) => ({
          ...price,
          shippingOptionId: createdShippingOption!.id,
        })),
      );

      return createdShippingOption!;
    });
  }

  async list() {
    return await useTransaction(async (tx) => {
      const shippingOptions = await tx
        .select()
        .from(shippingOptionsTable)
        .where(isNull(shippingOptionsTable.deletedAt));

      return shippingOptions;
    });
  }

  async delete(id: number) {
    return await createTransaction(async (tx) => {
      await tx
        .update(shippingOptionsTable)
        .set({ deletedAt: new Date() })
        .where(eq(shippingOptionsTable.id, id));
    });
  }

  async retrieve(id: number) {
    return await useTransaction(async (tx) => {
      const shippingOption = await tx
        .select()
        .from(shippingOptionsTable)
        .where(
          and(
            eq(shippingOptionsTable.id, id),
            isNull(shippingOptionsTable.deletedAt),
          ),
        );

      if (!shippingOption) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Shipping option with ID ${id} not found`,
        });
      }

      return shippingOption;
    });
  }

  async update(id: number, input: UpdateShippingOptionDTO) {
    return await createTransaction(async (tx) => {
      const { prices, ...rest } = input;

      await this.retrieve(id);

      await tx
        .update(shippingOptionsTable)
        .set(rest)
        .where(eq(shippingOptionsTable.id, id));

      await tx
        .delete(shippingOptionPricesTable)
        .where(eq(shippingOptionPricesTable.shippingOptionId, id));

      if (prices) {
        await tx.insert(shippingOptionPricesTable).values(
          prices.map((price) => ({
            ...price,
            shippingOptionId: id,
          })),
        );
      }

      return { id };
    });
  }
}
