import type { CreateProductDTO } from "./types";
import {
  productsTable,
  productTagsMappingTable,
  productVariantsTable,
  imagesTable,
  productMaterialsMappingTable,
  productOptionsTable,
  productOptionValuesTable,
  productVariantOptionsMappingTable,
} from "~/server/db/schema";
import { promiseAll } from "~/server/utils/promise-all";
import { isValidSlug, slugify } from "~/server/utils/slug";
import { createTransaction, useTransaction } from "~/server/db/transaction";
import { eq, isNull, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const list = async () => {
  return await useTransaction(async (tx) => {
    return await tx.query.productsTable.findMany({
      where: isNull(productsTable.deletedAt),
      with: {
        variants: {
          with: {
            options: true,
            prices: true,
          },
        },
        images: true,
        tags: true,
        materials: true,
        options: true,
        categories: true,
      },
    });
  });
};

export const fromID = async (id: number) => {
  return await useTransaction(async (tx) => {
    const product = await tx.query.productsTable.findFirst({
      where: and(eq(productsTable.id, id), isNull(productsTable.deletedAt)),
      with: {
        variants: {
          with: { options: { with: { optionValue: true } }, prices: true },
        },
        images: true,
        tags: true,
        materials: true,
        options: { with: { values: true } },
        categories: true,
      },
    });

    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Product with ID ${id} not found`,
      });
    }

    return product;
  });
};

export const create = async (input: CreateProductDTO) => {
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

  _validateProduct(input);

  return await createTransaction(async (tx) => {
    const [product] = await tx
      .insert(productsTable)
      .values({
        ...rest,
        status: rest.status ?? "draft",
        slug: slug ?? slugify(rest.title),
      })
      .returning({ id: productsTable.id });

    if (!product) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Product creation failed",
      });
    }

    const promises: Promise<unknown>[] = [];

    const optionsMap = new Map<string, { id: number; value: string }[]>();

    if (options?.length) {
      await promiseAll(
        options.map(async (option) => {
          const [createdOption] = await tx
            .insert(productOptionsTable)
            .values({
              name: option.name,
              productId: product.id,
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
    }

    if (variants?.length) {
      promises.push(
        ...variants.map(async (variant) => {
          const { options, prices, ...rest } = variant;

          const [createdVariant] = await tx
            .insert(productVariantsTable)
            .values({
              ...rest,
              productId: product.id,
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
              };
            }),
          );

          // todo: handle pricing using pricing module
        }),
      );
    }

    if (tags?.length) {
      promises.push(
        ...tags.map((tag) =>
          tx.insert(productTagsMappingTable).values({
            tagId: tag.id,
            productId: product.id,
          }),
        ),
      );
    }

    if (images?.length) {
      promises.push(
        ...images.map((url, rank) =>
          tx.insert(imagesTable).values({
            rank,
            imageUrl: url,
            productId: product.id,
          }),
        ),
      );
    }

    if (materials?.length) {
      promises.push(
        ...materials.map((material) =>
          tx.insert(productMaterialsMappingTable).values({
            materialId: material.id,
            productId: product.id,
          }),
        ),
      );
    }

    await promiseAll(promises);

    // todo: handle categories
    // todo: handle shipping options using fulfillment module
    // todo: emit event

    return product;
  });
};

const _validateProduct = (input: CreateProductDTO) => {
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
};

export const remove = async (id: number) => {
  return await createTransaction(async (tx) => {
    await tx
      .update(productsTable)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(productsTable.id, id));
  });
};
