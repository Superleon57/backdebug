import { body } from 'express-validator';

export const positionSchema = [
  body('payload.position')
    .isObject()
    .optional()
    .custom((value, { req }) => {
      if (!value) {
        return true;
      }
      if (!value.latitude || !value.longitude) {
        throw new Error('latitude and longitude are required');
      }
      return true;
    }),

  body('payload.position.latitude').isFloat().optional(),
  body('payload.position.longitude').isFloat().optional(),
];

export const paginationSchema = [
  body('payload.page').isInt({ min: 1 }).optional().default(1),
  body('payload.hitsPerPage').isInt({ min: 1, max: 100 }).optional().default(20),
];
