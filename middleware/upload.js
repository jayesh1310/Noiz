const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const songDir = path.join(__dirname, '..', 'uploads', 'songs');
const thumbDir = path.join(__dirname, '..', 'uploads', 'thumbnails');
fs.mkdirSync(songDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'songFile') {
      cb(null, songDir);
    } else if (file.fieldname === 'thumbnailFile') {
      cb(null, thumbDir);
    } else {
      cb(new Error('Unexpected field'), null);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove special chars, keep extension
    const sanitized = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase();
    const uniqueName = `${Date.now()}-${sanitized}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'songFile') {
    if (
      file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'audio/mp3'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Song file must be .mp3 format'), false);
    }
  } else if (file.fieldname === 'thumbnailFile') {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(
        new Error('Thumbnail must be .jpg, .jpeg, or .png format'),
        false
      );
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB overall max (songs)
  },
});

// Export a middleware that handles both files
const uploadSong = upload.fields([
  { name: 'songFile', maxCount: 1 },
  { name: 'thumbnailFile', maxCount: 1 },
]);

module.exports = { uploadSong };
