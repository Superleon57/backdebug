import { validationResult, matchedData } from "express-validator";

export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    req.body = matchedData(req, {
      includeOptionals: false,
      onlyValidData: true,
    });
    req.query = matchedData(req, {
      includeOptionals: false,
      onlyValidData: true,
    });
    next();
  }
};
