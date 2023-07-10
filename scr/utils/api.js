import { setRefreshCookie } from "src/utils/security";
import config from 'src/config'

export const getQueryParams = (params) => {
  const paramsQuery = new URLSearchParams();
  return Object.entries(params).reduce((acc, [key, value]) => {
    if (typeof value !== 'undefined' && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((param) => {
          acc.append(key, param);
        });
      } else {
        acc.append(key, value);
      }
    }
    return acc;
  }, paramsQuery);
};

export const handleLoginResponse = ({ serviceResponse, res }) => {
  const payload = {
    email: serviceResponse.email,
    firstName: serviceResponse.firstName,
    lastName: serviceResponse.lastName,
    idUser: serviceResponse.idUser,
    idCompany: serviceResponse.idCompany,
    accessToken: serviceResponse.accessToken,
    roles: serviceResponse.roles,
    department: serviceResponse.department,
    isCguAccepted:serviceResponse.isCguAccepted,
    refreshToken: "",
    isImpersonate: serviceResponse.isImpersonate,
  };

  if (config.IS_DEV) {
    payload.refreshToken = serviceResponse.refreshToken;
  } else {
    setRefreshCookie(res, serviceResponse.refreshToken);
  }

  return res.send({
    payload,
  }).status(200);
};