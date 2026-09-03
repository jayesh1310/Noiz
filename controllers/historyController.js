const ListeningHistory = require('../models/ListeningHistory');

// @desc    Record a song play
// @route   POST /api/history
const recordPlay = async (req, res, next) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'songId is required' });
    }

    await ListeningHistory.create({
      user: req.user._id,
      song: songId,
    });

    res.status(201).json({ message: 'Play recorded' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's recently played songs (last 10 unique)
// @route   GET /api/history/recent
const getRecentlyPlayed = async (req, res, next) => {
  try {
    // Get distinct recent songs — aggregate to de-duplicate
    const recent = await ListeningHistory.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { playedAt: -1 } },
      {
        $group: {
          _id: '$song',
          lastPlayed: { $first: '$playedAt' },
        },
      },
      { $sort: { lastPlayed: -1 } },
      { $limit: 10 },
    ]);

    const songIds = recent.map((r) => r._id);

    // Populate song details
    const Song = require('../models/Song');
    const songs = await Song.find({ _id: { $in: songIds } }).populate(
      'uploadedBy',
      'username firstName lastName'
    );

    // Maintain order from aggregation
    const songMap = {};
    songs.forEach((s) => {
      songMap[s._id.toString()] = s;
    });
    const ordered = songIds
      .map((id) => songMap[id.toString()])
      .filter(Boolean);

    res.json(ordered);
  } catch (error) {
    next(error);
  }
};

module.exports = { recordPlay, getRecentlyPlayed };
