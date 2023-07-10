import * as userRepository from 'src/repositories/user';
import * as authRepository from 'src/repositories/auth';

import { emailAlreadyExistException, unknownEmailException, unknownUserIdException } from 'src/utils/errors';
import { user } from 'src/entities/user';

export const getUserByEmail = async id => {
  const user = await userRepository.findOneByEmail(id);
  if (!user) {
    throw unknownEmailException;
  }
  delete user.password;
  delete user.notifToken;

  return user;
};

export const getUserByUid = async (uid: string) => {
  const user = await userRepository.findOneByUid(uid);
  if (!user) {
    throw unknownUserIdException;
  }
  delete user.password;
  delete user.notifToken;

  return user;
};

export const createShopAccount = async user => {
  const existingBddUser = await userRepository.findOneByEmail(user.email);
  if (existingBddUser) {
    throw emailAlreadyExistException;
  }

  const existingAuthUser = await authRepository.findOneByUid(user.uid);
  if (!existingAuthUser) {
    throw unknownUserIdException;
  }
  return await userRepository.createShopAccount(user);
};

export const createUser_InBdd = async (user: user) => {
  //check if user doesn't already exists in BDD
  const existingBddUser = await userRepository.findOneByEmail(user.email);
  if (existingBddUser) {
    throw emailAlreadyExistException;
  }
  //check if user exists in Auth
  const existingAuthUser = await authRepository.findOneByUid(user.uid);
  if (!existingAuthUser) {
    throw unknownUserIdException;
  }
  return await userRepository.create(user);
};

//todo: maybe delete this
//because fireAuth users should be created from front
//to manage tokens,
//and because it can only be that way with google/facebook auth
export const createUser_InAuth = async (user: user) => {
  const existingUser = await authRepository.findOneByEmail(user.email);

  if (existingUser) {
    throw emailAlreadyExistException;
  }

  const res = await authRepository.create({
    ...user,
  });

  return {
    user: res,
  };
};

export const updateUser = async (user: user) => {
  const existingUser = await userRepository.findOneByUid(user.uid);
  if (!existingUser) {
    throw unknownUserIdException;
  }
  return await userRepository.update(user);
};

export const removeUser = async (uid: string) => {
  const existingBddUser = await userRepository.findOneByUid(uid);

  if (existingBddUser) {
    await userRepository.remove(uid);
  }

  const existingAuthUser = await authRepository.findOneByUid(uid);

  if (!existingAuthUser) {
    throw unknownUserIdException;
  }

  const res = await authRepository.remove(uid);
  return res;
};

export const getMessagingToken = async (uid: string) => {
  const user = await userRepository.findOneByUid(uid);
  if (!user) {
    throw unknownUserIdException;
  }
  return user.notifToken;
};

export const socketLogin = async ({ uid, socketId }) => {
  await userRepository.socketLogin({ uid, socketId });
};

export const getUserSocket = async uid => {
  const userSocket = await userRepository.getUserSocket(uid);
  return userSocket;
};

export const getDeliveryManPublicData = async (uid: string) => {
  const user = await userRepository.findOneByUid(uid);
  if (!user) {
    throw unknownUserIdException;
  }
  return {
    uid: user.uid,
    name: user.name,
    phone: user.phone,
  };
};

export const getUserLastLocation = async ({ userId }: { userId: string }) => {
  const user = await getUserByUid(userId);
  if (!user) {
    throw unknownUserIdException;
  }

  if (!user.threeLastPositions) {
    throw new Error('User has no address');
  }

  const threeLastPositions = Object.values(user.threeLastPositions);

  if (threeLastPositions.length === 0) {
    throw new Error('User has no address');
  }

  const lastUpdatedPosition: any = threeLastPositions.reduce((prev: any, current: any) => (prev.updatedAt > current.updatedAt ? prev : current));

  return lastUpdatedPosition;
};
