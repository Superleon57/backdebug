import { body, check, header, param } from 'express-validator';

const validateString = (fieldName: string) => {
  return body(`payload.${fieldName}`)
    .isString()
    .withMessage(`Ce champ doit être une chaîne de caractères.`)
    .notEmpty()
    .withMessage(`Ce champ ne doit pas être vide.`)
    .trim()
    .withMessage(`Ce champ ne doit pas contenir de caractères spéciaux.`);
};

export const productSchema = [
  validateString('title'),
  body('payload.description').isString().optional().trim(),
  body('payload.price').isInt({ min: 0 }).withMessage('Le prix doit être un nombre.'),
  validateString('manufacturer'),
  body('payload.material').isString().optional().trim(),
  body('payload.supplierReference').isString().optional().trim(),
  body('payload.storeReference').isString().optional().trim(),

  check('payload.categories').isArray({ min: 1 }).withMessage('Le produit doit avoir au moins une catégorie.'),
  check('payload.ecoFriendly').isArray().optional({ checkFalsy: true }).withMessage('Le champ "ecoFriendly" doit être un tableau.'),
  check('payload.imagesURL').isArray({ min: 1 }).withMessage('Le produit doit avoir au moins une image.'),

  check('payload.gender')
    .isIn(['all', 'man', 'woman', 'boy', 'girl'])
    .withMessage('Le champ "gender" doit être une des valeurs suivantes: all, man, woman, boy, girl.'),

  body('payload.hasVariants').isBoolean().withMessage('Le champ "hasVariants" doit être un booléen.'),

  body('payload.quantity')
    .if(body('payload.hasVariants').equals('false'))
    .notEmpty()
    .withMessage("La quantité est obligatoire si le produit n'a pas de variantes.")
    .isInt({ min: 0 })
    .withMessage('La quantité doit être un nombre entier positif.'),

  body('payload.Variants')
    .if(body('payload.hasVariants').equals('false'))
    .isEmpty()
    .optional()
    .withMessage('Le champ "Variants" doit être vide si le produit n\'a pas des variantes.'),

  body('payload.Variants')
    .if(body('payload.hasVariants').equals('true'))
    .isArray({ min: 1 })
    .withMessage('Le champ "Variants" doit être un tableau et doit avoir au moins une variante.'),

  body('payload.Variants.*.id').notEmpty().withMessage('Chaque variante doit avoir un "id" non vide.'),
  body('payload.Variants.*.color.name').notEmpty().withMessage('Chaque variante doit avoir un nom de couleur non vide.'),
  body('payload.Variants.*.color.value').isHexColor().withMessage('La valeur de couleur doit être une valeur hexadécimale valide.'),
  body('payload.Variants.*.quantity').isInt().withMessage('La quantité de chaque variante doit être un nombre entier.'),
];

export const updateProductSchema = [param('productId').isString().notEmpty().trim(), ...productSchema];

export const productIdsListSchema = [
  body('payload.productIds').isArray({ min: 1, max: 20 }).withMessage('Le champ "productIds" doit être un tableau.'),
];

export const productsSchema = [];
