const multer = require('multer');
const { ApiError } = require('../utils/apiResponse');

// Use memory storage so we can stream to Cloudinary as a buffer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
});

/**
 * Multer middleware for single avatar/profile photo upload.
 * Field name: "avatar"
 */
const uploadAvatar = upload.single('avatar');

/**
 * Wrapper to convert multer errors to ApiError format.
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size exceeds the 5MB limit.'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Only one file can be uploaded at a time.'));
    }
    return next(new ApiError(400, `Upload error: ${err.message}`));
  }
  next(err);
};

module.exports = { uploadAvatar, handleMulterError };
