export type Fees = {
  id: string;
  baseDeliveryFee: number;
  deliveryFeePerKm: number;

  platformFee: number;
  useCustomFees: boolean;

  customerFees: CustomerFee[];
};

export type CustomerFee = {
  id: string;
  minimumCartPrice: number;
  maximumCartPrice: number;
  levels: FeesLevel[];
};

export type FeesLevel = {
  id: string;
  from: number;
  to: number;
  delivery: number;
  service: number;
};

export type CalculatedFees = {
  totalDeliveryCost: number;
  deliveryFee: number;
  serviceFee: number;
  totalPrice: number;
  subTotal: number;
  appFee: number;
  onlivyou: number;
  merchant: number;
};
