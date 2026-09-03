const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getFavorites,
  checkFavorite,
  getFavoriteIds,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.use(protect); // All favorite routes require auth

router.post('/toggle', toggleFavorite);
router.get('/ids', getFavoriteIds);
router.get('/check/:songId', checkFavorite);
router.get('/', getFavorites);

module.exports = router;
