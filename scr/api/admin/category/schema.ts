import { body } from 'express-validator';
import { badImageFormat } from 'src/utils/errors';

export const categorySchema = [
  body('name').isString().trim().isLength({ max: 100 }).withMessage('Le titre de la catégorie doit faire au maximum 100 caractères.'),
];
