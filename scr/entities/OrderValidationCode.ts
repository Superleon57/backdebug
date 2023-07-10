import type { Timestamp } from 'firebase-admin/firestore';

export type OrderValidationCode = {
  code: number;
  createdAt: Timestamp;
  OrderNumber: string;
  type: 'DELIVERY' | 'TAKING';
};
