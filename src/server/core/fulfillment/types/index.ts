export type CreateShippingOptionDTO = {
  isShippingProfile: boolean;
  name: string;
  postalCode: string;
  countryCode: string;
  prices: CreateShippingOptionPriceDTO[];
};

export type UpdateShippingOptionDTO = Partial<CreateShippingOptionDTO> & {
  id: number;
};

export type CreateShippingOptionPriceDTO = {
  amount: number;
  currency: string;
  rules?: Record<string, unknown>;
};
