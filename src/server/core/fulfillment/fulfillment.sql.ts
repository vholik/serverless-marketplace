import { createTable, createTimestampsColumns } from "~/server/db/schema";

export const shippingOptionsTable = createTable("shipping_options", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  isShippingProfile: d.integer({ mode: "boolean" }).notNull(),
  name: d.text({ length: 256 }).notNull(),
  postalCode: d.text({ length: 20 }),
  countryCode: d.text({ length: 2 }),
}));

export const shippingOptionPricesTable = createTable(
  "shipping_option_prices",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    shippingOptionId: d
      .integer({ mode: "number" })
      .references(() => shippingOptionsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    amount: d.integer({ mode: "number" }).notNull(),
    currency: d.text({ length: 256 }).notNull(),
    rules: d.text({ mode: "json" }).default("{}"),
  }),
);
