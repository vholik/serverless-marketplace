export type CreatePriceDTO = {
  variantId: number;
  amount: number;
  currency: string;
  rules?: Record<string, unknown>;
  type: "default" | "sale";
};
