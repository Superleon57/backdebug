import { body, header, check, oneOf } from 'express-validator';
import { cp } from 'fs';
import moment from 'moment';

const shopHeader = header('shop').isString().notEmpty().trim();

export const shopSchema = [
  body('payload.name').isString(),
  body('payload.description').isString(),
  body('payload.image').isString().trim(),
  body('payload.type').isString(),
  body('payload.localisation.latitude').isNumeric(),
  body('payload.localisation.longitude').isNumeric(),
  body('payload.addr1').isString(),
  body('payload.addr2').isString(),
  body('payload.cp').isString().trim(),
  body('payload.ville').isString(),
];

export const shopInformationsSchema = [
  body('payload.name').isString(),
  body('payload.description').isString(),
  body('payload.slogan').isString(),
];

export const shopAddressSchema = [body('payload.placeId').isString()];

export const shopConfigSchema = [
  body('payload.shopId').isString().trim(),
  body('payload.newConfig.url').isString().trim(),
  body('payload.newConfig.api_key').isString().trim(),
  body('payload.newConfig.type').isString().trim(),
];

const AllDaysAreValid = () => {
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return check('payload.openingTimes')
    .custom(async (value, { req }) => {
      if (value.length < 7 || value.length > 7) {
        throw new Error('Invalid days');
      }
      // days.forEach(day => {
      //   if (!value.find(slot => slot.day === day)) {
      //     throw new Error('Invalid days');
      //   }
      // });
      return true;
    })
    .optional({ checkFalsy: true });
};

const AllSlotsAreValid = () => {
  return check('payload.openingTimes')
    .custom(async (value, { req }) => {
      value.forEach(day => {
        if (day.isClosed) {
          return true;
        }
        if (!day.slots?.length) {
          throw new Error('You must specify at least one slot');
        }
        day.slots.forEach(slot => {
          if (!slot.opening || !slot.closing) {
            throw new Error('Slots must have an opening and a closing time');
          }
          var opening = moment(slot.opening, 'hh:mm');
          var closing = moment(slot.closing, 'hh:mm');

          if (closing.isBefore(opening)) {
            throw new Error('Closing time must be after opening time');
          }
        });
      });
    })
    .optional({ checkFalsy: true });
};

export const shopOpeningTimeSchema = [body('payload.openingTimes').isArray().not().isEmpty(), AllDaysAreValid(), AllSlotsAreValid()];

export const messagingTokenSchema = [body('payload.token').isString().notEmpty().trim()];

export const addAdminSchema = [body('payload.userId').isString().notEmpty().trim()];

export const colorSchema = [
  body('payload.name').isString().notEmpty().trim(),
  check('payload.value')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être sous la forme #RRGGBB'),
];

export const sizeSchema = [body('payload.name').isString().notEmpty().trim(), body('payload.value').isString().notEmpty().trim()];
