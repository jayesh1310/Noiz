const express = require('express');
const router = express.Router();
const { recordPlay, getRecentlyPlayed } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.use(protect); // All history routes require auth

router.post('/', recordPlay);
router.get('/recent', getRecentlyPlayed);

module.exports = router;
