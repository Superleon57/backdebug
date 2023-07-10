import ioc from 'src/utils/iocContainer';
import { v4 as uuidv4 } from 'uuid';

import multer from 'multer';
const memoStorage = multer.memoryStorage();

export const upload = multer({ memoStorage });

const getFileUrl = (firebaseBucket, folderName, fileName) =>
  `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket.name}/o/${folderName}%2F${fileName}?alt=media`;

const formatFileName = (fileName, newFileName = '') => {
  const extension = fileName.split('.').pop();

  newFileName = newFileName || uuidv4();

  return `${newFileName}.${extension}`;
};

export const uploadImage = async ({ fileName, contents, uploadFolder, newFileName = '' }) => {
  try {
    const firebaseBucket = await ioc.get('firebaseBucket');

    const newFileFullName = formatFileName(fileName, newFileName);

    await firebaseBucket.file(`${uploadFolder}/${newFileFullName}`).save(contents);

    const encodedUploadFolderName = encodeURIComponent(uploadFolder);

    return getFileUrl(firebaseBucket, encodedUploadFolderName, newFileFullName);
  } catch (err) {
    throw err;
  }
};
