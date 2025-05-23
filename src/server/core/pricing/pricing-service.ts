import { createTransaction } from "~/server/db/transaction";
import type { CreatePriceDTO } from "./types";
import { priceTable } from "~/server/db/schema";
import { inArray } from "drizzle-orm";

export class Pricing {
  async create(input: CreatePriceDTO | CreatePriceDTO[]) {
    return await createTransaction(async (tx) => {
      const toCreate = Array.isArray(input) ? input : [input];

      const prices = await tx
        .insert(priceTable)
        .values(toCreate)
        .returning({ id: priceTable.id });

      return prices;
    });
  }

  async delete(ids: number | number[]) {
    return await createTransaction(async (tx) => {
      const idsArray = Array.isArray(ids) ? ids : [ids];

      await tx.delete(priceTable).where(inArray(priceTable.id, idsArray));
    });
  }
}
