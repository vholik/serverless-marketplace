import { type IdDTO } from "../../types";

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
  shippingOptions?: CreateProductShippingOptionDTO[];
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

export type CreateProductShippingOptionDTO = {
  name: string;
  postalCode?: string;
  countryCode?: string;
};

export type CreateProductShippingOptionPriceDTO = {
  amount: number;
  currencyCode: string;
  rules: Record<string, string>;
};

export type UpdateProductVariantDTO = Partial<CreateProductVariantDTO>;
