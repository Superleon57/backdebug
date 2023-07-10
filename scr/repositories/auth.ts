import { emailAlreadyExistException, unknownUserUIdException } from 'src/utils/errors';
import { user } from 'src/entities/user';

import ioc from 'src/utils/iocContainer';


export const findOneByEmail = async (email:string) => {
  const auth = ioc.get('firestoreAuth');

  try {
    var user:user;
    user = await auth.getUserByEmail(email);
    return user;
  } catch {
    return null;
  }
};

export const findOneByUid = async uid => {
  const auth = ioc.get('firestoreAuth');

  try {
    var user:user;
    user = await auth.getUser(uid);
    return user;
  } catch (error) {
    return null;
  }
};


export const create = async ({email, password, firstName, lastName}) => {
  const auth = ioc.get('firestoreAuth');

  try {
    return await auth.createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: firstName + ' ' + lastName,
      disabled: false,
    });

  } catch (error: any) {
    if (error.code === '23505') {
      throw emailAlreadyExistException;
    }
    throw error;
  }
};


export const remove = async (uid:string) => {
  const auth = ioc.get('firestoreAuth');

  try {
    return await auth.deleteUser(uid);

  } catch (error: any) {
    throw error;
  }
};

