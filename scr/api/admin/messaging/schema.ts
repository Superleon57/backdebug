import { body, header } from 'express-validator';

export const updateMessagingSchema = [body('payload.token').isString().trim()];
