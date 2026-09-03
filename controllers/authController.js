const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { username, firstName, lastName, password, genres } = req.body;

    // Validate required fields
    if (!username || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate username format
    if (!/^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/.test(username)) {
      return res.status(400).json({
        message:
          'Username must be 3-20 characters, start with a letter or underscore, and contain only letters, numbers, or underscores.',
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create user
    const user = await User.create({
      username,
      firstName,
      lastName,
      password,
      genres: Array.isArray(genres) ? genres : [],
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      genres: user.genres,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password, loginType } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' }); // generic response initially
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Role verification
    if (loginType === 'admin' && user.isAdmin !== true) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    if (loginType === 'user' && user.isAdmin === true) {
      return res.status(401).json({ message: 'Please use admin login' });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      genres: user.genres,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      genres: user.genres,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user's preferred genres
// @route   PUT /api/auth/genres
const updateGenres = async (req, res, next) => {
  try {
    const { genres } = req.body;

    if (!Array.isArray(genres)) {
      return res
        .status(400)
        .json({ message: 'Genres must be an array' });
    }

    const validGenres = [
      'pop', 'rock', 'hiphop', 'electronic', 'jazz',
      'classical', 'lofi', 'folk', 'soul', 'country',
    ];

    const filtered = genres.filter((g) => validGenres.includes(g));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { genres: filtered },
      { new: true }
    );

    res.json({
      _id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      genres: user.genres,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateGenres };
