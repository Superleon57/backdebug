import { body, param, check } from 'express-validator';

export const orderSchema = [
  body('payload.userId').isString().trim(),
  body('payload.shopId').isString().trim(),
  body('payload.productId').isString().trim(),
];

export const orderNextStepSchema = [body('payload.shopId').isString().trim(), body('payload.orderId').isString().trim()];

export const orderValidationCodeSchema = [param('orderNumber').isString().trim()];

export const locationSchema = [param('orderNumber').isString().trim()];

const geolocIsValide = (value, { req }) => {
  const { latitude, longitude } = req.body.payload.geoloc;
  if (latitude && longitude) {
    return true;
  }
  return false;
};

export const confirmSchema = [
  body('payload.amount').isNumeric(),
];

export const orderInfoSchema = [param('orderNumber').isString().trim()];
