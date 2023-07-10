import { body, check, param } from 'express-validator';

export const updateShopStatusSchema = [body('payload.shopId').isString().trim(), body('payload.disabled').isBoolean()];

const validatePrice = (fieldName: string) => {
  return body(`payload.fees.${fieldName}`).isNumeric().withMessage('Cette valeur doit être un nombre.');
};

const validateKm = (fieldName: string) => {
  return body(`payload.fees.${fieldName}`)
    .isNumeric()
    .withMessage('Cette valeur doit être un nombre.')
    .isInt({ min: 0 })
    .withMessage('Cette valeur doit être supérieure ou égale à 0.');
};

const feesLevels = [
  body('payload.fees.customerFees.*.levels').isArray({ min: 1 }),
  // .withMessage('Le champ "levels" doit être un tableau.')
  // .custom((value, { req }) => {
  //   const levels = value;

  //   if (levels.length === 0) {
  //     throw new Error('Le tableau "levels" doit contenir au moins un élément.');
  //   }

  //   levels.forEach((level: any) => {
  //     const { id, from, to } = level;
  //     const index = levels.findIndex((level: any) => level.id === id);

  //     if (from && to && from >= to) {
  //       throw new Error('La valeur "from" doit être inférieure à la valeur "to".');
  //     }

  //     if (index === levels.length - 1) {
  //       return true;
  //     }

  //     const previousLevel = levels[index - 1];
  //     const { to: previousTo } = previousLevel;

  //     if (from && previousTo && from <= previousTo) {
  //       throw new Error('La valeur "from" doit être supérieure à la valeur "to" du niveau précédent.');
  //     }

  //     return true;
  //   });
  // }),

  body('payload.fees.customerFees.levels.*.id').isString(),
  validatePrice('customerFees.levels.*.delivery'),
  validatePrice('customerFees.levels.*.service'),
  validateKm('customerFees.levels.*.from'),
  validateKm('customerFees.levels.*.to'),

  check('payload.fees.customerFees.levels.*.from').custom((value, { req }) => {
    const { customerFees } = req.body.payload.fees;
    const { levels } = customerFees;

    const index = levels.findIndex((level: any) => level.id === req.body.payload.fees.customerFees.levels.id);

    if (to && value >= to) {
      throw new Error('La valeur "from" doit être inférieure à la valeur "to".');
    }

    return true;
  }),
  check('payload.fees.customerFees.levels.*.to').custom((value, { req }) => {
    const { customerFees } = req.body.payload.fees;
    const { levels } = customerFees;
    const index = levels.findIndex((level: any) => level.id === req.body.payload.fees.customerFees.levels.id);

    if (index === levels.length - 1) {
      return true;
    }
  }),

  validatePrice('customerFees.levels.*.from'),
  validatePrice('customerFees.levels.*.to'),
];

const customerFees = [
  body('payload.fees.customerFees').isArray({ min: 1 }).withMessage('Le champ "customerFees" doit être un tableau.'),

  body('payload.fees.customerFees.*.id').isString(),
  body('payload.fees.customerFees.*.minimumCartPrice').isNumeric().withMessage('Cette valeur doit être un nombre.').toInt(),
  body('payload.fees.customerFees.*.maximumCartPrice').isNumeric().withMessage('Cette valeur doit être un nombre.').toInt(),
  ...feesLevels,
];

export const feesSchema = [
  validatePrice('baseDeliveryFee'),
  validatePrice('deliveryFeePerKm'),

  body('payload.fees.platformFee')
    .isNumeric()
    .isInt({ min: 0, max: 100 })
    .withMessage('Cette valeur doit être un nombre entier entre 0 et 100.')
    .toInt(),

  ...customerFees,
];

export const updateShopFeesSchema = [body('payload.shopId').isString().trim(), body('payload.fees.useCustomFees').isBoolean(), ...feesSchema];
export const shopFeesSchema = [param('shopId').isString().trim()];
