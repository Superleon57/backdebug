import { body } from 'express-validator';

//todo: régler pour création
export const profileSchema = [
  body('payload.uid').optional().isString().trim(),
  body('payload.firstName').optional().isString().trim(),
  body('payload.lastName').optional().isString().trim(),
  body('payload.email').isEmail().trim(),
  body('payload.password').isString(),
  body('payload.phone').optional().isString().trim(),
  body('payload.photo').optional().isString(),
  body('payload.address').optional(),
  body('payload.role').optional(),
  body('payload.bankcards').optional(),

  //ces éléments ne sont pas nécéssaire pour front user
  //si ils sont nécéssaire pour un autre front,
  //créer une autre route pour un type de user différent?
  body('payload.isNewsletterAccepted').optional().isBoolean(),
  body('payload.placeId').optional().isString().trim(),
  body('payload.authProvider').optional().isString().trim(),
  body('payload.iban').optional().isString().trim(),
  body('payload.cover').optional().isString(),
  body('payload.oldPassword').optional().isString(),
  body('payload.locale').optional().isString().trim(),
];

export const createUserSchema = [
  body('payload.uid').isString().trim(),
  body('payload.firstName').isString().trim(),
  body('payload.lastName').isString().trim(),
  body('payload.email').isEmail().trim(),
  body('payload.phone').isString().trim(),
  body('payload.photo').optional().isString(),
  body('payload.address'),
  body('payload.role').isString(),
  body('payload.bankcards'),
];

export const updateUserSchema = [
  body('payload.uid').isString().trim(), //todo: changer
  body('payload.firstName').optional().isString().trim(),
  body('payload.lastName').optional().isString().trim(),
  body('payload.phone').optional().isString().trim(),
  body('payload.photo').optional().isString(),
  body('payload.address').optional(),
  body('payload.role').optional().isString(),
  body('payload.bankcards').optional(),
];