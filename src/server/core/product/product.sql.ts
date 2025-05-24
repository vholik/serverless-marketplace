import { sql } from "drizzle-orm";
import { createTable, createTimestampsColumns } from "~/server/db/schema";
import { shippingOptionsTable } from "../fulfillment";
import { primaryKey, uniqueIndex } from "drizzle-orm/sqlite-core";

export const productsTable = createTable(
  "products",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    status: d
      .text({ enum: ["draft", "published", "rejected", "proposed"] })
      .notNull()
      .default("proposed"),
    title: d.text({ length: 256 }).notNull(),
    subtitle: d.text({ length: 256 }),
    description: d.text(),
    slug: d.text({ length: 256 }).notNull(),
    weight: d.integer({ mode: "number" }),
    width: d.integer({ mode: "number" }),
    height: d.integer({ mode: "number" }),
    depth: d.integer({ mode: "number" }),
    attributes: d.text({ mode: "json" }).default("{}"),
    originCountry: d.text({ length: 256 }),
  }),
  (t) => [
    uniqueIndex("products_slug_unique_where_not_deleted")
      .on(t.slug)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const productOptionsTable = createTable("product_options", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d
    .integer({ mode: "number" })
    .references(() => productsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  name: d.text({ length: 256 }).notNull(),
}));

export const productOptionValuesTable = createTable(
  "product_option_values",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    productOptionId: d
      .integer({ mode: "number" })
      .references(() => productOptionsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    value: d.text({ length: 256 }).notNull(),
  }),
);

export const imagesTable = createTable("product_images", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d
    .integer({ mode: "number" })
    .references(() => productsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  imageUrl: d.text({ length: 256 }).notNull(),
  rank: d.integer({ mode: "number" }).notNull(),
}));

export const productTagsTable = createTable(
  "tags",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    value: d.text({ length: 256 }).notNull(),
  }),
  (t) => [
    uniqueIndex("tags_value_unique_where_not_deleted")
      .on(t.value)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const productTagsMappingTable = createTable(
  "product_tags",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    tagId: d
      .integer({ mode: "number" })
      .references(() => productTagsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.tagId] })],
);

export const productMaterialsTable = createTable(
  "materials",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    value: d.text({ length: 256 }).notNull(),
  }),
  (t) => [
    uniqueIndex("materials_value_unique_where_not_deleted")
      .on(t.value)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const productMaterialsMappingTable = createTable(
  "product_materials",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    materialId: d
      .integer({ mode: "number" })
      .references(() => productMaterialsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.materialId] })],
);

export const productVariantsTable = createTable("product_variants", (d) => ({
  id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  ...createTimestampsColumns(d),
  productId: d
    .integer({ mode: "number" })
    .references(() => productsTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  attributes: d.text({ mode: "json" }).default("{}"),
  title: d.text({ length: 256 }).notNull(),
  description: d.text(),
  sku: d.text({ length: 256 }),
  quantity: d.integer({ mode: "number" }).default(0).notNull(),
  manageStock: d.integer({ mode: "boolean" }).notNull().default(true),
}));

export const productVariantOptionsMappingTable = createTable(
  "product_variant_options",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    productVariantId: d
      .integer({ mode: "number" })
      .references(() => productVariantsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    productOptionValueId: d
      .integer({ mode: "number" })
      .references(() => productOptionValuesTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  }),
);

export const categoriesTable = createTable(
  "categories",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    ...createTimestampsColumns(d),
    name: d.text({ length: 256 }).notNull(),
    description: d.text(),
    slug: d.text({ length: 256 }).notNull(),
    parentId: d.integer({ mode: "number" }),
  }),
  (t) => [
    uniqueIndex("categories_slug_unique_where_not_deleted")
      .on(t.slug)
      .where(sql`${t.deletedAt} is null`),
  ],
);

export const productCategoriesMappingTable = createTable(
  "product_categories",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    categoryId: d
      .integer({ mode: "number" })
      .references(() => categoriesTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
);

export const productShippingOptionsMappingTable = createTable(
  "product_shipping_options",
  (d) => ({
    productId: d
      .integer({ mode: "number" })
      .references(() => productsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    shippingOptionId: d
      .integer({ mode: "number" })
      .references(() => shippingOptionsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  }),
  (t) => [primaryKey({ columns: [t.productId, t.shippingOptionId] })],
);
