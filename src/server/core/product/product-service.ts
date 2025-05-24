import { promiseAll } from "~/server/utils/promise-all";
import { isValidSlug, slugify } from "~/server/utils/slug";
import { createTransaction, useTransaction } from "~/server/db/transaction";
import { eq, isNull, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import type { IdDTO } from "~/server/types";
import type {
  CreateProductDTO,
  CreateProductOptionDTO,
  CreateProductVariantDTO,
  UpdateProductDTO,
} from "./types";
import type { Pricing } from "../pricing";
import {
  categoriesTable,
  imagesTable,
  productCategoriesMappingTable,
  productMaterialsMappingTable,
  productMaterialsTable,
  productOptionsTable,
  productOptionValuesTable,
  productShippingOptionsMappingTable,
  productsTable,
  productTagsMappingTable,
  productTagsTable,
  productVariantOptionsMappingTable,
  productVariantsTable,
} from "./product.sql";
import {
  shippingOptionPricesTable,
  shippingOptionsTable,
} from "../fulfillment";

export class Product {
  constructor(private readonly pricing: Pricing) {}

  async list() {
    return await useTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(productsTable)
        .where(isNull(productsTable.deletedAt))
        .leftJoin(imagesTable, eq(productsTable.id, imagesTable.productId))
        .leftJoin(
          productTagsMappingTable,
          eq(productsTable.id, productTagsMappingTable.productId),
        )
        .leftJoin(
          productTagsTable,
          eq(productTagsMappingTable.tagId, productTagsTable.id),
        )
        .leftJoin(
          productMaterialsMappingTable,
          eq(productsTable.id, productMaterialsMappingTable.productId),
        )
        .leftJoin(
          productMaterialsTable,
          eq(productMaterialsMappingTable.materialId, productMaterialsTable.id),
        )
        .leftJoin(
          productVariantsTable,
          eq(productsTable.id, productVariantsTable.productId),
        )
        .leftJoin(
          productVariantOptionsMappingTable,
          eq(
            productVariantsTable.id,
            productVariantOptionsMappingTable.productVariantId,
          ),
        )
        .leftJoin(
          productOptionValuesTable,
          eq(
            productVariantOptionsMappingTable.productOptionValueId,
            productOptionValuesTable.id,
          ),
        )
        .leftJoin(
          productCategoriesMappingTable,
          eq(productsTable.id, productCategoriesMappingTable.productId),
        )
        .leftJoin(
          categoriesTable,
          eq(productCategoriesMappingTable.categoryId, categoriesTable.id),
        )
        .leftJoin(
          productShippingOptionsMappingTable,
          eq(productsTable.id, productShippingOptionsMappingTable.productId),
        )
        .leftJoin(
          shippingOptionsTable,
          eq(
            productShippingOptionsMappingTable.shippingOptionId,
            shippingOptionsTable.id,
          ),
        )
        .leftJoin(
          shippingOptionPricesTable,
          eq(
            shippingOptionsTable.id,
            shippingOptionPricesTable.shippingOptionId,
          ),
        );

      // todo: add serialize

      return rows;
    });
  }

  async retrieve(id: number) {
    return await useTransaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(productsTable)
        .where(and(isNull(productsTable.deletedAt), eq(productsTable.id, id)))
        .leftJoin(imagesTable, eq(productsTable.id, imagesTable.productId))
        .leftJoin(
          productTagsMappingTable,
          eq(productsTable.id, productTagsMappingTable.productId),
        )
        .leftJoin(
          productTagsTable,
          eq(productTagsMappingTable.tagId, productTagsTable.id),
        )
        .leftJoin(
          productMaterialsMappingTable,
          eq(productsTable.id, productMaterialsMappingTable.productId),
        )
        .leftJoin(
          productMaterialsTable,
          eq(productMaterialsMappingTable.materialId, productMaterialsTable.id),
        )
        .leftJoin(
          productVariantsTable,
          eq(productsTable.id, productVariantsTable.productId),
        )
        .leftJoin(
          productVariantOptionsMappingTable,
          eq(
            productVariantsTable.id,
            productVariantOptionsMappingTable.productVariantId,
          ),
        )
        .leftJoin(
          productOptionValuesTable,
          eq(
            productVariantOptionsMappingTable.productOptionValueId,
            productOptionValuesTable.id,
          ),
        )
        .leftJoin(
          productCategoriesMappingTable,
          eq(productsTable.id, productCategoriesMappingTable.productId),
        )
        .leftJoin(
          categoriesTable,
          eq(productCategoriesMappingTable.categoryId, categoriesTable.id),
        )
        .leftJoin(
          productShippingOptionsMappingTable,
          eq(productsTable.id, productShippingOptionsMappingTable.productId),
        )
        .leftJoin(
          shippingOptionsTable,
          eq(
            productShippingOptionsMappingTable.shippingOptionId,
            shippingOptionsTable.id,
          ),
        )
        .leftJoin(
          shippingOptionPricesTable,
          eq(
            shippingOptionsTable.id,
            shippingOptionPricesTable.shippingOptionId,
          ),
        );

      // todo: add serialize

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return row;
    });
  }

  async create(input: CreateProductDTO) {
    const {
      options,
      images,
      tags,
      materials,
      variants,
      categories,
      shippingOptions,
      slug,
      ...rest
    } = input;

    this.validateProduct_(input);

    return await createTransaction(async (tx) => {
      const [product_] = await tx
        .insert(productsTable)
        .values({
          ...rest,
          status: rest.status ?? "draft",
          slug: slug ?? slugify(rest.title),
        })
        .returning({ id: productsTable.id });

      const product = product_!;

      const promises: Promise<unknown>[] = [];

      const optionsMap = new Map<string, { id: number; value: string }[]>();

      if (options?.length) {
        await this.upsertOptions_(product.id, options, optionsMap);
      }

      if (categories?.length) {
        promises.push(this.upsertCategories_(product.id, categories));
      }

      if (variants?.length) {
        promises.push(this.upsertVariants_(product.id, variants, optionsMap));
      }

      if (tags?.length) {
        promises.push(this.upsertTags_(product.id, tags));
      }

      if (images?.length) {
        promises.push(this.upsertImages_(product.id, images));
      }

      if (materials?.length) {
        promises.push(this.upsertMaterials_(product.id, materials));
      }

      await promiseAll(promises);

      if (shippingOptions?.length) {
        promises.push(this.upsertShippingOptions_(product.id, shippingOptions));
      }

      // todo: emit event

      return product;
    });
  }

  async update(input: UpdateProductDTO) {
    const {
      id,
      categories,
      tags,
      materials,
      variants,
      shippingOptions,
      options,
      images,
      ...rest
    } = input;

    return await createTransaction(async (tx) => {
      await tx.update(productsTable).set(rest).where(eq(productsTable.id, id));

      const promises: Promise<unknown>[] = [];

      const optionsMap = new Map<string, { id: number; value: string }[]>();

      if (options?.length) {
        await this.upsertOptions_(id, options, optionsMap);
      }

      if (categories?.length) {
        promises.push(this.upsertCategories_(id, categories));
      }

      if (tags?.length) {
        promises.push(this.upsertTags_(id, tags));
      }

      if (materials?.length) {
        promises.push(this.upsertMaterials_(id, materials));
      }

      if (variants?.length) {
        promises.push(this.upsertVariants_(id, variants, optionsMap));
      }

      if (images?.length) {
        promises.push(this.upsertImages_(id, images));
      }

      if (shippingOptions?.length) {
        promises.push(this.upsertShippingOptions_(id, shippingOptions));
      }

      await promiseAll(promises);
    });
  }

  async delete(id: number) {
    return await createTransaction(async (tx) => {
      await tx
        .update(productsTable)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(productsTable.id, id));
    });
  }

  private validateProduct_(input: CreateProductDTO) {
    const { slug, variants, options } = input;

    if (slug && !isValidSlug(slug)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid slug",
      });
    }

    if (variants?.length && !options?.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Variants are not allowed without options",
      });
    }
  }

  private async upsertCategories_(productId: number, categories: IdDTO[]) {
    return await createTransaction(async (tx) => {
      const existingCategories = await tx
        .select({ categoryId: productCategoriesMappingTable.categoryId })
        .from(productCategoriesMappingTable)
        .where(
          inArray(
            productCategoriesMappingTable.categoryId,
            categories.map((category) => category.id),
          ),
        );

      const existingCategoriesSet = new Set(
        existingCategories.map((category) => category.categoryId),
      );

      await promiseAll(
        categories.map((category) => {
          if (!existingCategoriesSet.has(category.id)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Category with ID ${category.id} not found`,
            });
          }

          return tx.insert(productCategoriesMappingTable).values({
            productId,
            categoryId: category.id,
          });
        }),
      );
    });
  }

  private async upsertMaterials_(productId: number, materials: IdDTO[]) {
    return await createTransaction(async (tx) => {
      const existingMaterials = await tx
        .select({ id: productMaterialsTable.id })
        .from(productMaterialsTable)
        .where(
          inArray(
            productMaterialsTable.id,
            materials.map((material) => material.id),
          ),
        );

      const existingMaterialsSet = new Set(
        existingMaterials.map((material) => material.id),
      );

      await promiseAll(
        materials.map((material) => {
          if (!existingMaterialsSet.has(material.id)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Material with ID ${material.id} not found`,
            });
          }

          return tx.insert(productMaterialsMappingTable).values({
            materialId: material.id,
            productId: productId,
          });
        }),
      );
    });
  }

  private async upsertTags_(productId: number, tags: IdDTO[]) {
    return await createTransaction(async (tx) => {
      const existingTags = await tx
        .select({ id: productTagsTable.id })
        .from(productTagsTable)
        .where(
          inArray(
            productTagsTable.id,
            tags.map((tag) => tag.id),
          ),
        );

      const existingTagsSet = new Set(existingTags.map((tag) => tag.id));

      await promiseAll(
        tags.map((tag) => {
          if (!existingTagsSet.has(tag.id)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Tag with ID ${tag.id} not found`,
            });
          }

          return tx.insert(productTagsMappingTable).values({
            tagId: tag.id,
            productId,
          });
        }),
      );
    });
  }

  private async upsertOptions_(
    productId: number,
    options: CreateProductOptionDTO[],
    optionsMap: Map<string, { id: number; value: string }[]>,
  ) {
    return await createTransaction(async (tx) => {
      await promiseAll(
        options.map(async (option) => {
          const [createdOption] = await tx
            .insert(productOptionsTable)
            .values({
              name: option.name,
              productId,
            })
            .returning({ id: productOptionsTable.id });

          const createdOptionValues = await tx
            .insert(productOptionValuesTable)
            .values(
              option.values.map((value) => ({
                value,
                productOptionId: createdOption!.id,
              })),
            )
            .returning({
              id: productOptionValuesTable.id,
              value: productOptionValuesTable.value,
            });

          createdOptionValues.forEach((optionValue) => {
            const existingOptionValues = optionsMap.get(option.name);

            optionsMap.set(option.name, [
              ...(existingOptionValues ?? []),
              { id: optionValue.id, value: optionValue.value },
            ]);
          });
        }),
      );
    });
  }

  private async upsertVariants_(
    productId: number,
    variants: CreateProductVariantDTO[],
    optionsMap: Map<string, { id: number; value: string }[]>,
  ) {
    return await createTransaction(async (tx) => {
      await tx
        .delete(productVariantsTable)
        .where(eq(productVariantsTable.productId, productId));

      await promiseAll(
        variants.map(async (variant) => {
          const { options, prices, ...rest } = variant;

          const [createdVariant] = await tx
            .insert(productVariantsTable)
            .values({
              ...rest,
              productId,
            })
            .returning({ id: productVariantsTable.id });

          await tx.insert(productVariantOptionsMappingTable).values(
            Object.entries(options).map(([key, value]) => {
              const option = optionsMap.get(key);

              if (!option) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Option ${key} not found`,
                });
              }

              const optionValue = option.find(
                (option) => option.value === value,
              );

              if (!optionValue) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Option value ${value} not found`,
                });
              }

              return {
                productVariantId: createdVariant!.id,
                productOptionValueId: optionValue.id,
                productId,
              };
            }),
          );

          if (prices?.length) {
            await this.pricing.create(
              prices.map((price) => ({
                ...price,
                variantId: createdVariant!.id,
              })),
            );
          }
        }),
      );
    });
  }

  private async upsertImages_(productId: number, images: string[]) {
    return await createTransaction(async (tx) => {
      await tx.delete(imagesTable).where(eq(imagesTable.productId, productId));

      await tx.insert(imagesTable).values(
        images.map((url, rank) => ({
          rank,
          imageUrl: url,
          productId,
        })),
      );
    });
  }

  private async upsertShippingOptions_(
    productId: number,
    shippingOptionsIds: IdDTO[],
  ) {
    return await createTransaction(async (tx) => {
      await tx
        .delete(productShippingOptionsMappingTable)
        .where(eq(productShippingOptionsMappingTable.productId, productId));

      await tx.insert(productShippingOptionsMappingTable).values(
        shippingOptionsIds.map((id) => ({
          productId,
          shippingOptionId: id.id,
        })),
      );
    });
  }
}
