import { relations, sql } from "drizzle-orm";
import { index, primaryKey, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import type { SQLiteColumnBuilders } from "drizzle-orm/sqlite-core/columns/all";
import { type AdapterAccount } from "next-auth/adapters";

const createTimestampsColumns = (d: SQLiteColumnBuilders) => ({
  createdAt: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  deletedAt: d.integer({ mode: "timestamp" }),
});

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `serverless-marketplace_${name}`,
);

export const usersTable = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  image: d.text({ length: 255 }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  accounts: many(accountsTable),
}));

export const accountsTable = createTable(
  "account",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => usersTable.id),
    type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.text({ length: 255 }).notNull(),
    providerAccountId: d.text({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.text({ length: 255 }),
    scope: d.text({ length: 255 }),
    id_token: d.text(),
    session_state: d.text({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsTable = createTable(
  "session",
  (d) => ({
    sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => usersTable.id),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const verificationTokensTable = createTable(
  "verification_token",
  (d) => ({
    identifier: d.text({ length: 255 }).notNull(),
    token: d.text({ length: 255 }).notNull(),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const productsTable = createTable("products", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  status: d
    .text()
    .notNull()
    .$type<"draft" | "published" | "rejected" | "proposed">()
    .notNull()
    .default("draft"),
  rejectionReason: d.text(),
  rejectedAt: d.integer({ mode: "timestamp" }),
  title: d.text({ length: 256 }).notNull(),
  subtitle: d.text({ length: 256 }),
  description: d.text(),
  slug: d.text({ length: 256 }).notNull(),
  weight: d.integer({ mode: "number" }),
  width: d.integer({ mode: "number" }),
  height: d.integer({ mode: "number" }),
  depth: d.integer({ mode: "number" }),
  metadata: d.text({ mode: "json" }),
  originCountry: d.text({ length: 256 }),
}));

export const productsRelations = relations(productsTable, ({ many }) => ({
  images: many(imagesTable),
  options: many(productOptionsTable),
  variants: many(productVariantsTable),
  tags: many(productTagsMappingTable),
  materials: many(productMaterialsMappingTable),
  categories: many(productCategoriesMappingTable),
  prices: many(priceTable),
}));

export const productOptionsTable = createTable("product_options", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d
    .integer({ mode: "number" })
    .references(() => productsTable.id)
    .notNull(),
  name: d.text({ length: 256 }).notNull(),
}));

export const productOptionsRelations = relations(
  productOptionsTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [productOptionsTable.productId],
      references: [productsTable.id],
    }),
    values: many(productOptionValuesTable),
  }),
);

export const productOptionValuesTable = createTable(
  "product_option_values",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    productOptionId: d
      .integer({ mode: "number" })
      .references(() => productOptionsTable.id)
      .notNull(),
    value: d.text({ length: 256 }).notNull(),
  }),
);

export const productOptionValuesRelations = relations(
  productOptionValuesTable,
  ({ one }) => ({
    option: one(productOptionsTable, {
      fields: [productOptionValuesTable.productOptionId],
      references: [productOptionsTable.id],
    }),
  }),
);

export const imagesTable = createTable("product_images", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d.integer({ mode: "number" }).references(() => productsTable.id),
  imageUrl: d.text({ length: 256 }).notNull(),
  rank: d.integer({ mode: "number" }).notNull(),
}));

export const imagesRelations = relations(imagesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [imagesTable.productId],
    references: [productsTable.id],
  }),
}));

export const productTagsTable = createTable("tags", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  value: d.text({ length: 256 }).unique().notNull(),
}));

export const productTagsRelations = relations(productTagsTable, ({ many }) => ({
  products: many(productTagsMappingTable),
}));

export const productTagsMappingTable = createTable(
  "product_tags",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id)
      .notNull(),
    tagId: d
      .integer({ mode: "number" })
      .references(() => productTagsTable.id)
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.tagId] })],
);

export const productTagsMappingRelations = relations(
  productTagsMappingTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productTagsMappingTable.productId],
      references: [productsTable.id],
    }),
    tag: one(productTagsTable, {
      fields: [productTagsMappingTable.tagId],
      references: [productTagsTable.id],
    }),
  }),
);

export const productMaterialsTable = createTable("materials", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  value: d.text({ length: 256 }).unique().notNull(),
}));

export const productMaterialsRelations = relations(
  productMaterialsTable,
  ({ many }) => ({
    products: many(productMaterialsMappingTable),
  }),
);

export const productMaterialsMappingTable = createTable(
  "product_materials",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id)
      .notNull(),
    materialId: d
      .integer({ mode: "number" })
      .references(() => productMaterialsTable.id)
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.materialId] })],
);

export const productMaterialsMappingRelations = relations(
  productMaterialsMappingTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productMaterialsMappingTable.productId],
      references: [productsTable.id],
    }),
    material: one(productMaterialsTable, {
      fields: [productMaterialsMappingTable.materialId],
      references: [productMaterialsTable.id],
    }),
  }),
);

export const productVariantsTable = createTable("product_variants", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d
    .integer({ mode: "number" })
    .references(() => productsTable.id)
    .notNull(),
  title: d.text({ length: 256 }).notNull(),
  description: d.text(),
  sku: d.text({ length: 256 }),
  quantity: d.integer({ mode: "number" }).default(0).notNull(),
  manageStock: d.integer({ mode: "boolean" }).notNull().default(true),
}));

export const productVariantsRelations = relations(
  productVariantsTable,
  ({ one, many }) => ({
    product: one(productsTable, {
      fields: [productVariantsTable.productId],
      references: [productsTable.id],
    }),
    options: many(productVariantOptionsMappingTable),
    prices: many(priceTable),
  }),
);

export const productVariantOptionsMappingTable = createTable(
  "product_variant_options",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    productVariantId: d
      .integer({ mode: "number" })
      .references(() => productVariantsTable.id)
      .notNull(),
    productOptionValueId: d
      .integer({ mode: "number" })
      .references(() => productOptionValuesTable.id)
      .notNull(),
  }),
);

export const productVariantOptionsRelations = relations(
  productVariantOptionsMappingTable,
  ({ one }) => ({
    variant: one(productVariantsTable, {
      fields: [productVariantOptionsMappingTable.productVariantId],
      references: [productVariantsTable.id],
    }),
    optionValue: one(productOptionValuesTable, {
      fields: [productVariantOptionsMappingTable.productOptionValueId],
      references: [productOptionValuesTable.id],
    }),
  }),
);

export const categoriesTable = createTable("categories", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  name: d.text({ length: 256 }).notNull(),
  description: d.text(),
  slug: d.text({ length: 256 }).notNull(),
  parentId: d.integer({ mode: "number" }),
}));

export const categoriesRelationsWithSelf = relations(
  categoriesTable,
  ({ one }) => ({
    parent: one(categoriesTable, {
      fields: [categoriesTable.parentId],
      references: [categoriesTable.id],
    }),
  }),
);

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productCategoriesMappingTable),
}));

export const productCategoriesMappingTable = createTable(
  "product_categories",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id)
      .notNull(),
    categoryId: d
      .integer({ mode: "number" })
      .references(() => categoriesTable.id)
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
);

export const productCategoriesRelations = relations(
  productCategoriesMappingTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [productCategoriesMappingTable.productId],
      references: [productsTable.id],
    }),
    category: one(categoriesTable, {
      fields: [productCategoriesMappingTable.categoryId],
      references: [categoriesTable.id],
    }),
  }),
);

export const priceTable = createTable("prices", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  variantId: d
    .integer({ mode: "number" })
    .references(() => productVariantsTable.id)
    .notNull(),
  amount: d.integer({ mode: "number" }).notNull(),
  currencyCode: d.text({ length: 256 }).notNull(),
  rules: d.text({ mode: "json" }),
  type: d.text().$type<"default" | "sale">().notNull(),
}));

export const priceRelations = relations(priceTable, ({ one }) => ({
  variant: one(productVariantsTable, {
    fields: [priceTable.variantId],
    references: [productVariantsTable.id],
  }),
}));

export const shippingOptionsTable = createTable("shipping_options", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  isShippingProfile: d.integer({ mode: "boolean" }).notNull(),
  name: d.text({ length: 256 }).notNull(),
  postalCode: d.text({ length: 20 }),
  countryCode: d.text({ length: 2 }),
}));

export const shippingOptionsRelations = relations(
  shippingOptionsTable,
  ({ many }) => ({
    prices: many(shippingOptionPricesTable),
  }),
);

export const shippingOptionPricesTable = createTable(
  "shipping_option_prices",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    shippingOptionId: d
      .integer({ mode: "number" })
      .references(() => shippingOptionsTable.id)
      .notNull(),
    amount: d.integer({ mode: "number" }).notNull(),
    currencyCode: d.text({ length: 256 }).notNull(),
    rules: d.text(), // {countryCode: 'pl'}
  }),
);

export const shippingOptionPricesRelations = relations(
  shippingOptionPricesTable,
  ({ one }) => ({
    shippingOption: one(shippingOptionsTable, {
      fields: [shippingOptionPricesTable.shippingOptionId],
      references: [shippingOptionsTable.id],
    }),
  }),
);
