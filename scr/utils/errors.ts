export const emailAlreadyExistException = {
  status: 400,
  message: 'Email already exist.',
  code: 'EMAIL_ALREADY_EXIST',
};

export const uidAlreadyExistException = {
  status: 400,
  message: 'Uid already exist.',
  code: 'UID_ALREADY_EXIST',
};

export const godsonAlreadyExistException = {
  status: 400,
  message: 'filleul already exist.',
  code: 'GODSON_ALREADY_EXIST',
};

export const cgvNotAcceptedException = {
  status: 400,
  message: 'CGV not accepted.',
  code: 'CGV_NOT_ACCEPTED',
};

export const cguNotAcceptedException = {
  status: 400,
  message: 'CGU not accepted.',
  code: 'CGU_NOT_ACCEPTED',
};

export const undefinedAdressException = {
  status: 400,
  message: "google don't know this adress",
  code: 'ADRESS_UNKNOWN',
};

export const unknownEmailException = {
  status: 400,
  message: 'Unknown email.',
  code: 'UNKNOWN_EMAIL',
};

export const wrongPasswordException = {
  status: 400,
  message: 'Wrong password.',
  code: 'WRONG_PASSWORD',
};

export const unknownUserException = {
  status: 400,
  message: 'Unknown user.',
  code: 'UNKNOWN_USER',
};

export const unknownUserIdException = {
  status: 400,
  message: 'Unknown id.',
  code: 'UNKNOWN_ID',
};

export const unknownUserUIdException = {
  status: 400,
  message: 'Unknown uid.',
  code: 'UNKNOWN_UID',
};

export const forbiddenActionException = {
  status: 403,
  message: 'Not allowed to perform this action.',
  code: 'FORBIDDEN_ACTION',
};

export const unknownTokenException = {
  status: 403,
  message: 'Unknown token.',
  code: 'UNKNOWN_TOKEN',
};

export const initAlreadyDoneException = {
  status: 403,
  message: 'Init already executed.',
  code: 'INIT_ALREADY_DONE_EXCEPTION',
};

export const linkerNotAllowException = {
  status: 400,
  message: "linker can't be own sponsorship.",
  code: 'LINKER_NOT_ALLOW',
};

export const candidateStillExistsException = {
  status: 400,
  message: 'Candidate already exists.',
  code: 'CANDIDATE_STILL_EXISTS',
};

export const vacancyLinkNotExistsException = {
  status: 400,
  message: 'Vacancy link does not exists.',
  code: 'VACANCY_LINK_NOT_EXISTS_EXCEPTION',
};

export const notLinkerCandidateException = {
  status: 403,
  message: 'Only linker could candidate.',
  code: 'NOT_LINKER_CANDIDATE',
};

export const unknownSession = {
  status: 400,
  message: 'Unknown session.',
  code: 'UNKNOWN_SESSION',
};

export const noUserSession = {
  status: 400,
  message: 'No session to revoke.',
  code: 'NO_USER_SESSION',
};

export const invalidPassword = {
  status: 400,
  message: 'Password not match.',
  code: 'INVALID_PASSWORD',
};

export const notValidatedUser = {
  status: 401,
  message: 'You should validate your email first.',
  code: 'NOT_VALIDATED_USER',
};

export const lostPasswordTokenExpire = {
  status: 401,
  message: 'Your token expired. Ask a new one.',
  code: 'LOST_PASSWORD_TOKEN_EXPIRE',
};

export const godsonAlreadyExist = {
  status: 403,
  message: 'Godson already exist.',
  code: 'GODSON_ALREADY_EXIST',
};

export const duplicateSponsorshipError = {
  status: 403,
  message: 'duplicate sponsorship.',
  code: 'DUPLICATE_SPONSPORSHIP_ERROR',
};

export const colorAlreadyExist = {
  status: 403,
  message: 'Color already exist.',
  code: 'COLOR_ALREADY_EXIST',
};

export const sizeAlreadyExist = {
  status: 403,
  message: 'Size already exist.',
  code: 'SIZE_ALREADY_EXIST',
};

export const undefinedShopException = {
  status: 400,
  message: 'Shop does not exist.',
  code: 'UNDEFINED_SHOP',
};

export const shopAddressNotValid = {
  status: 400,
  message: "L'adresse du magasin n'est pas valide",
  code: 'SHOP_ADDRESS_NOT_VALID',
};

export const shopOpeningTimesNotValid = {
  status: 400,
  message: "Les horaires d'ouverture du magasin ne sont pas valides",
  code: 'SHOP_OPENING_TIMES_NOT_VALID',
};

export const colorNotFound = {
  status: 400,
  message: 'Color not found.',
  code: 'COLOR_NOT_FOUND',
};

export const sizeNotFound = {
  status: 400,
  message: 'Size not found.',
  code: 'SIZE_NOT_FOUND',
};

export const productNotFound = {
  status: 400,
  message: 'Product not found.',
  code: 'PRODUCT_NOT_FOUND',
};

export const variantNotFound = {
  status: 400,
  message: 'Variant not found.',
  code: 'VARIANT_NOT_FOUND',
};

export const imageTooBig = {
  status: 400,
  message: "L'image ne doit pas dépasser 2Mo",
  code: 'IMAGE_TOO_BIG',
};

export const categoryNotFound = {
  status: 400,
  message: 'Category not found.',
  code: 'CATEGORY_NOT_FOUND',
};

export const categoryAlreadyExist = {
  status: 400,
  message: 'Category already exist.',
  code: 'CATEGORY_ALREADY_EXIST',
};

export const badImageFormat = {
  status: 400,
  message: "Le format de l'image n'est pas valide",
  code: 'BAD_IMAGE_FORMAT',
};

export const orderNotFound = {
  status: 400,
  message: 'Order not found.',
  code: 'ORDER_NOT_FOUND',
};

export const productNotAvailable = {
  status: 400,
  message: 'This product is not available',
  code: 'PRODUCT_NOT_AVAILABLE',
};

export const onlyOneShopAtATime = {
  status: 400,
  message: 'You can only order from one shop at a time',
  code: 'ONLY_ONE_SHOP_AT_A_TIME',
};

export const noVariantId = {
  status: 400,
  message: 'You must provide a variantId',
  code: 'NO_VARIANT_ID',
};

export const invalidVariantId = {
  status: 400,
  message: 'Invalid variantId',
  code: 'INVALID_VARIANT_ID',
};

export const variantOutOfStock = {
  status: 400,
  message: 'This variant is out of stock',
  code: 'VARIANT_OUT_OF_STOCK',
};
