import argon2 from "argon2";
import * as jwt from "jsonwebtoken";

import config from "src/config";

export const getRefreshTokenFromCookie = (req) => {
  if (config.IS_DEV_OR_IS_TEST) {
    return req.cookies.jwtRefreshToken;
  } else {
    return req.signedCookies.jwtRefreshToken;
  }
};

export const getAccessTokenFromHeader = (req) => {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }
};

export const generateToken = (user, secret, expiresIn) => {
  const data = {
    email: user.email,
  };
  return jwt.sign({ data }, secret, { expiresIn });
};

export const getHashedPassword = async(password) => {
  return await argon2.hash(password);
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("jwtRefreshToken", refreshToken, {
    secure: true,
    httpOnly: true,
    path: "/",
    //expires: new Date(new Date().getTime() + 1000 * 60 * 60 * parseInt(config.JWT_REFRESH_SECRET_LIFETIME_IN_HOURS, 10)),
    signed: true,
    sameSite: "None",
  });
};
