import { emailAlreadyExistException, unknownUserUIdException } from 'src/utils/errors';
import { user } from 'src/entities/user';

import ioc from 'src/utils/iocContainer';

export const getUserRef = () => {
  const db = ioc.get('firestore') as FirebaseFirestore.Firestore;
  return db.collection('users');
};

export const findOneByEmail = async (email: string) => {
  const userRepository = ioc.get('userRepository');
  return await userRepository.whereEqualTo('email', email).findOne();
};

export const findOneByUid = async (uid: string) => {
  const userRepository = ioc.get('userRepository');
  return await userRepository.whereEqualTo('uid', uid).findOne();
};

export const create = async (newUser: user) => {
  try {
    const userRepository = ioc.get('userRepository');
    const theUser = new user();
    theUser.id = newUser.uid;
    theUser.uid = newUser.uid;
    theUser.firstName = newUser.firstName;
    theUser.lastName = newUser.lastName;
    theUser.email = newUser.email;
    theUser.phone = newUser?.phone;
    theUser.photo = newUser?.photo;
    theUser.address = newUser?.address;
    theUser.role = newUser?.role;
    theUser.bankcards = newUser?.bankcards;

    return await userRepository.create(theUser);
  } catch (error: any) {
    if (error.code === '23505') {
      throw emailAlreadyExistException;
    }
    throw error;
  }
};

export const createShopAccount = async user => {
  try {
    const userRef = getUserRef();

    const newUser = {
      id: user.uid,
      uid: user.uid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };

    return await userRef.doc(user.uid).set(newUser);
  } catch (error: any) {
    if (error.code === '23505') {
      throw emailAlreadyExistException;
    }
    throw error;
  }
};

export const update = async (newUser: user) => {
  try {
    const userRepository = ioc.get('userRepository');
    const theUser = await userRepository.whereEqualTo('uid', newUser.uid).findOne();

    theUser.firstName = newUser.firstName;
    theUser.lastName = newUser.lastName;
    theUser.phone = newUser.phone;
    theUser.photo = newUser.photo;
    theUser.address = newUser.address;
    theUser.role = newUser.role;
    theUser.bankcards = newUser.bankcards;

    return await userRepository.update(theUser);
  } catch (error: any) {
    throw error;
  }
};

export const remove = async (uid: string) => {
  try {
    const userRepository = ioc.get('userRepository');
    const theUser = await userRepository.whereEqualTo('uid', uid).findOne();

    return await userRepository.delete(uid);
  } catch (error: any) {
    throw error;
  }
};

export const socketLogin = async ({ uid, socketId }) => {
  const db = ioc.get('db');
  const customerRef = db.ref(`customers/${uid}`);
  customerRef.update({
    uid,
    socketId,
  });
};
export const socketDisconect = async ({ uid }) => {
  const db = ioc.get('db');
  const customerRef = db.ref(`customers/${uid}`);
  customerRef.update({
    socketId: null,
  });
};

export const getUserSocket = uid => {
  const db = ioc.get('db');
  const customerRef = db.ref(`customers/${uid}`);

  return new Promise(resolve => {
    customerRef.once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
};
