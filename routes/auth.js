const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateGenres } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/genres', protect, updateGenres);

module.exports = router;
