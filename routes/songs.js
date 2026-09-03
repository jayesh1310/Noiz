const express = require('express');
const router = express.Router();
const {
  getSongs,
  getFypSongs,
  getTrendingSongs,
  getMyUploads,
  searchSongs,
  getSongById,
  uploadSong,
  deleteSong,
} = require('../controllers/songController');
const { protect } = require('../middleware/auth');
const { uploadSong: uploadMiddleware } = require('../middleware/upload');

// Public routes
router.get('/search', searchSongs);
router.get('/trending', getTrendingSongs);
router.get('/', getSongs);

// Protected routes
router.get('/fyp', protect, getFypSongs);
router.get('/my-uploads', protect, getMyUploads);
router.post('/', protect, uploadMiddleware, uploadSong);
router.delete('/:id', protect, deleteSong);

// Param routes last
router.get('/:id', getSongById);

module.exports = router;
