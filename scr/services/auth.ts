import * as authRepository from 'src/repositories/auth';

export const createAuth = async ({ email, password, firstName, lastName }) => {
  return await authRepository.create({ email, password, firstName, lastName });
};
