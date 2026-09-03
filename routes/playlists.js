const express = require('express');
const router = express.Router();
const {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist
} = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // all routes are protected

router.route('/')
  .post(createPlaylist)
  .get(getPlaylists);

router.route('/:id')
  .get(getPlaylistById)
  .delete(deletePlaylist);

router.put('/:id/add', addSongToPlaylist);
router.put('/:id/remove', removeSongFromPlaylist);

module.exports = router;
