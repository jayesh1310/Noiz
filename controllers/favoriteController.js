const Favorite = require('../models/Favorite');

// @desc    Toggle favorite for a song
// @route   POST /api/favorites/toggle
const toggleFavorite = async (req, res, next) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      song: songId,
    });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.json({ isFavorited: false });
    } else {
      await Favorite.create({ user: req.user._id, song: songId });
      return res.json({ isFavorited: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite songs
// @route   GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'song',
        populate: { path: 'uploadedBy', select: 'username firstName lastName' },
      })
      .sort({ createdAt: -1 });

    // Extract just the song objects, filter out any null refs
    const songs = favorites
      .map((f) => f.song)
      .filter(Boolean);

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Check if a song is favorited by current user
// @route   GET /api/favorites/check/:songId
const checkFavorite = async (req, res, next) => {
  try {
    const existing = await Favorite.findOne({
      user: req.user._id,
      song: req.params.songId,
    });

    res.json({ isFavorited: !!existing });
  } catch (error) {
    next(error);
  }
};

// @desc    Get IDs of all songs favorited by current user (bulk check)
// @route   GET /api/favorites/ids
const getFavoriteIds = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).select(
      'song'
    );
    const ids = favorites.map((f) => f.song.toString());
    res.json(ids);
  } catch (error) {
    next(error);
  }
};

module.exports = { toggleFavorite, getFavorites, checkFavorite, getFavoriteIds };
