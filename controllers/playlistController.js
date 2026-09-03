const Playlist = require('../models/Playlist');

// @desc    Create a new playlist
// @route   POST /api/playlists
const createPlaylist = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name: name.trim(),
      user: req.user._id,
      songs: [],
    });

    res.status(201).json(playlist);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Playlist with this name already exists' });
    }
    next(error);
  }
};

// @desc    Get all playlists for logged-in user
// @route   GET /api/playlists
const getPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(playlists);
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single playlist by ID (with populated songs)
// @route   GET /api/playlists/:id
const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.user._id })
      .populate({
        path: 'songs',
        populate: { path: 'uploadedBy', select: 'username firstName lastName' }
      });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a song to playlist
// @route   PUT /api/playlists/:id/add
const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, songs: { $ne: songId } },
      { $push: { songs: songId } },
      { new: true }
    ).populate('songs');

    if (!playlist) {
      const exists = await Playlist.findOne({ _id: req.params.id, user: req.user._id });
      if (exists) {
        return res.status(400).json({ message: 'Song is already in this playlist' });
      }
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a song from playlist
// @route   PUT /api/playlists/:id/remove
const removeSongFromPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a playlist
// @route   DELETE /api/playlists/:id
const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found or unauthorized' });
    }
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlaylist,
  getPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist
};
