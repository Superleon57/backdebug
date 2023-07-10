"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateSponsorshipError = exports.godsonAlreadyExist = exports.lostPasswordTokenExpire = exports.notValidatedUser = exports.invalidPassword = exports.noUserSession = exports.unknownSession = exports.notLinkerCandidateException = exports.vacancyLinkNotExistsException = exports.candidateStillExistsException = exports.linkerNotAllowException = exports.initAlreadyDoneException = exports.unknownTokenException = exports.forbiddenActionException = exports.unknownIdUser = exports.unknownUserException = exports.wrongPasswordException = exports.unknownEmailException = exports.undefinedAdressException = exports.cguNotAcceptedException = exports.cgvNotAcceptedException = exports.godsonAlreadyExistException = exports.emailAlreadyExistException = void 0;
exports.emailAlreadyExistException = {
    status: 400,
    message: "Email already exist.",
    code: "EMAIL_ALREADY_EXIST",
};
exports.godsonAlreadyExistException = {
    status: 400,
    message: "filleul already exist.",
    code: "GODSON_ALREADY_EXIST",
};
exports.cgvNotAcceptedException = {
    status: 400,
    message: "CGV not accepted.",
    code: "CGV_NOT_ACCEPTED",
};
exports.cguNotAcceptedException = {
    status: 400,
    message: "CGU not accepted.",
    code: "CGU_NOT_ACCEPTED",
};
exports.undefinedAdressException = {
    status: 400,
    message: "google don't know this adress",
    code: "ADRESS_UNKNOWN",
};
exports.unknownEmailException = {
    status: 400,
    message: "Unknown email.",
    code: "UNKNOWN_EMAIL",
};
exports.wrongPasswordException = {
    status: 400,
    message: "Wrong password.",
    code: "WRONG_PASSWORD",
};
exports.unknownUserException = {
    status: 400,
    message: "Unknown user.",
    code: "UNKNOWN_USER",
};
exports.unknownIdUser = {
    status: 400,
    message: "Unknown id.",
    code: "UNKNOWN_EMAIL",
};
exports.forbiddenActionException = {
    status: 403,
    message: "Not allowed to perform this action.",
    code: "FORBIDDEN_ACTION",
};
exports.unknownTokenException = {
    status: 403,
    message: "Unknown token.",
    code: "UNKNOWN_TOKEN",
};
exports.initAlreadyDoneException = {
    status: 403,
    message: "Init already executed.",
    code: "INIT_ALREADY_DONE_EXCEPTION",
};
exports.linkerNotAllowException = {
    status: 400,
    message: "linker can't be own sponsorship.",
    code: "LINKER_NOT_ALLOW",
};
exports.candidateStillExistsException = {
    status: 400,
    message: "Candidate already exists.",
    code: "CANDIDATE_STILL_EXISTS",
};
exports.vacancyLinkNotExistsException = {
    status: 400,
    message: "Vacancy link does not exists.",
    code: "VACANCY_LINK_NOT_EXISTS_EXCEPTION",
};
exports.notLinkerCandidateException = {
    status: 403,
    message: "Only linker could candidate.",
    code: "NOT_LINKER_CANDIDATE",
};
exports.unknownSession = {
    status: 400,
    message: "Unknown session.",
    code: "UNKNOWN_SESSION",
};
exports.noUserSession = {
    status: 400,
    message: "No session to revoke.",
    code: "NO_USER_SESSION",
};
exports.invalidPassword = {
    status: 400,
    message: "Password not match.",
    code: "INVALID_PASSWORD",
};
exports.notValidatedUser = {
    status: 401,
    message: "You should validate your email first.",
    code: "NOT_VALIDATED_USER",
};
exports.lostPasswordTokenExpire = {
    status: 401,
    message: "Your token expired. Ask a new one.",
    code: "LOST_PASSWORD_TOKEN_EXPIRE",
};
exports.godsonAlreadyExist = {
    status: 403,
    message: "Godson already exist.",
    code: "GODSON_ALREADY_EXIST",
};
exports.duplicateSponsorshipError = {
    status: 403,
    message: "duplicate sponsorship.",
    code: "DUPLICATE_SPONSPORSHIP_ERROR",
};
