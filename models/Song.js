const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: [
        'pop', 'rock', 'hiphop', 'electronic', 'jazz',
        'classical', 'lofi', 'folk', 'soul', 'country',
      ],
    },
    filePath: {
      type: String,
      required: [true, 'Song file path is required'],
    },
    thumbnailPath: {
      type: String,
      required: [true, 'Thumbnail path is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null for seeded/admin-added songs
    },
    plays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for text search on title and artist
songSchema.index({ title: 'text', artist: 'text' });

module.exports = mongoose.model('Song', songSchema);
