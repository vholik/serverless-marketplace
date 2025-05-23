import type { IdDTO } from "~/server/types";

export type ProductStatus = "draft" | "published" | "rejected" | "proposed";

export type PriceType = "default" | "sale";

export type CreateProductDTO = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  slug?: string;
  status?: ProductStatus;
  weight?: number | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  metadata?: Record<string, unknown>;
  originCountry?: string | null;
  options?: CreateProductOptionDTO[];
  images?: string[];
  tags?: IdDTO[];
  materials?: IdDTO[];
  variants?: CreateProductVariantDTO[];
  categories?: IdDTO[];
  shippingOptions?: IdDTO[];
};

export type CreateProductOptionDTO = {
  name: string;
  values: string[];
};

export type CreateProductVariantDTO = {
  title: string;
  description?: string | null;
  sku?: string | null;
  quantity?: number;
  manageStock?: boolean;
  options: Record<string, string>;
  prices?: CreateProductVariantPriceDTO[];
};

export type CreateProductVariantPriceDTO = {
  amount: number;
  currencyCode: string;
  rules: Record<string, string>;
  type: PriceType;
};

export type CreateCategoryDTO = {
  name: string;
  description?: string | null;
  slug?: string;
  parentId?: number | null;
};

export type UpdateCategoryDTO = Partial<CreateCategoryDTO> & {
  id: number;
};

export type CreateTagDTO = {
  value: string;
};

export type CreateMaterialDTO = {
  value: string;
};

export type UpdateProductDTO = Partial<CreateProductDTO> & {
  id: number;
};
