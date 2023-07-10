import sharp from 'sharp';
import { imageTooBig } from 'src/utils/errors';

const compressImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const { buffer, mimetype } = req.file;

    const fileSize = buffer.length / 1024 / 1024;
    if (fileSize > 2) {
      throw imageTooBig;
    }

    const compressedImage = await sharp(buffer).toFormat('jpeg', { quality: 70 }).toBuffer();

    req.file.buffer = compressedImage;
    req.file.originalname = `${Date.now()}.${mimetype.split('/')[1]}`;

    next();
  } catch (err) {
    next(err);
  }
};

export default compressImage;
