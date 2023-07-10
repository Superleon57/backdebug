export const fileExistsInUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  return next();
};
