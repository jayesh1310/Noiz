const Song = require('../models/Song');
const Favorite = require('../models/Favorite');
const fs = require('fs');
const path = require('path');

// @desc    Get all songs (filter by genre or artist)
// @route   GET /api/songs
const getSongs = async (req, res, next) => {
  try {
    const { genre, artist } = req.query;
    const filter = {};

    if (genre) filter.genre = genre;
    if (artist) filter.artist = { $regex: artist, $options: 'i' };

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized "For You" songs based on user genres
// @route   GET /api/songs/fyp
const getFypSongs = async (req, res, next) => {
  try {
    const userGenres = req.user.genres || [];

    let songs;

    if (userGenres.length > 0) {
      // Get songs matching user genres, prioritized, then others
      const matchingSongs = await Song.find({ genre: { $in: userGenres } })
        .populate('uploadedBy', 'username firstName lastName')
        .sort({ createdAt: -1 });

      const otherSongs = await Song.find({ genre: { $nin: userGenres } })
        .populate('uploadedBy', 'username firstName lastName')
        .sort({ createdAt: -1 });

      songs = [...matchingSongs, ...otherSongs];
    } else {
      // No genres selected — return all sorted by newest
      songs = await Song.find()
        .populate('uploadedBy', 'username firstName lastName')
        .sort({ createdAt: -1 });
    }

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending songs (most favorited, limit 20)
// @route   GET /api/songs/trending
const getTrendingSongs = async (req, res, next) => {
  try {
    // Aggregate favorites to find most popular songs
    const trending = await Favorite.aggregate([
      { $group: { _id: '$song', favoriteCount: { $sum: 1 } } },
      { $sort: { favoriteCount: -1 } },
      { $limit: 20 },
    ]);

    const songIds = trending.map((t) => t._id);

    let songs;
    if (songIds.length > 0) {
      songs = await Song.find({ _id: { $in: songIds } }).populate(
        'uploadedBy',
        'username firstName lastName'
      );

      // Maintain the trending order
      const songMap = {};
      songs.forEach((s) => {
        songMap[s._id.toString()] = s;
      });
      songs = songIds
        .map((id) => songMap[id.toString()])
        .filter(Boolean);
    } else {
      // If no favorites yet, return newest songs
      songs = await Song.find()
        .populate('uploadedBy', 'username firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's uploaded songs
// @route   GET /api/songs/my-uploads
const getMyUploads = async (req, res, next) => {
  try {
    const songs = await Song.find({ uploadedBy: req.user._id })
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Search songs by title or artist
// @route   GET /api/songs/search
const searchSongs = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } },
      ],
    })
      .populate('uploadedBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single song by ID
// @route   GET /api/songs/:id
const getSongById = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate(
      'uploadedBy',
      'username firstName lastName'
    );

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    res.json(song);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a new song
// @route   POST /api/songs
const uploadSong = async (req, res, next) => {
  try {
    const { title, artist, genre } = req.body;

    if (!title || !genre) {
      return res
        .status(400)
        .json({ message: 'Title and genre are required' });
    }

    if (!req.files || !req.files.songFile || !req.files.thumbnailFile) {
      return res
        .status(400)
        .json({ message: 'Both song file and thumbnail are required' });
    }

    const songFile = req.files.songFile[0];
    const thumbFile = req.files.thumbnailFile[0];

    // Build the artist name from request or user's name
    const songArtist =
      artist ||
      `${req.user.firstName} ${req.user.lastName}`;

    const song = await Song.create({
      title,
      artist: songArtist,
      genre,
      filePath: `uploads/songs/${songFile.filename}`,
      thumbnailPath: `uploads/thumbnails/${thumbFile.filename}`,
      uploadedBy: req.user._id,
    });

    const populated = await song.populate(
      'uploadedBy',
      'username firstName lastName'
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a song (owner or admin)
// @route   DELETE /api/songs/:id
const deleteSong = async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Check authorization: owner or admin
    const isOwner =
      song.uploadedBy &&
      song.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this song' });
    }

    // Delete files from disk
    const songPath = path.join(__dirname, '..', song.filePath);
    const thumbPath = path.join(__dirname, '..', song.thumbnailPath);

    try {
      if (fs.existsSync(songPath)) fs.unlinkSync(songPath);
    } catch (e) {
      console.error('Error deleting song file:', e.message);
    }
    try {
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    } catch (e) {
      console.error('Error deleting thumbnail:', e.message);
    }

    // Remove associated favorites and history
    await Favorite.deleteMany({ song: song._id });

    // Delete the song document
    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSongs,
  getFypSongs,
  getTrendingSongs,
  getMyUploads,
  searchSongs,
  getSongById,
  uploadSong,
  deleteSong,
};
