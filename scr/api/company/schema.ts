import { body, query } from "express-validator";

export const companySchema = [
  body("payload.name").isString().trim(),
  body("payload.description").isString().trim(),
];