import { createTable, createTimestampsColumns } from "~/server/db/schema";
import { productVariantsTable } from "../product";

export const priceTable = createTable("prices", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  variantId: d
    .integer({ mode: "number" })
    .references(() => productVariantsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  amount: d.integer({ mode: "number" }).notNull(),
  currency: d.text({ length: 256 }).notNull(),
  rules: d.text({ mode: "json" }).default("{}"),
  type: d.text().$type<"default" | "sale">().notNull(),
}));
