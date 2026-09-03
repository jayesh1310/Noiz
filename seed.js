/**
 * Database Seed Script
 * Creates admin user and populates sample songs idempotently
 *
 * Run: cd backend && npm run seed
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Song = require('./models/Song');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Keep existing songs (like user uploads) intact.
    console.log('Checking for missing seed songs...');

    // ── 1. Admin User Setup ───────────────────────────────────
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        firstName: 'System',
        lastName: 'Admin',
        password: 'admin123',
        genres: ['pop', 'rock', 'hiphop', 'electronic'],
        isAdmin: true,
      });
      console.log(`Admin user created: ${adminUser.username}`);
    } else {
      console.log(`Found existing admin user: ${adminUser.username}`);
    }

    // ── 2. Add New Songs ──────────────────────────────────────
    const songsDir = path.join(__dirname, 'uploads', 'songs');
    const thumbsDir = path.join(__dirname, 'uploads', 'thumbnails');
    if (!fs.existsSync(songsDir)) fs.mkdirSync(songsDir, { recursive: true });
    if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

    // Explicit mapping of exact filenames found in uploads/songs/ and uploads/thumbnails/
    const exactFileNames = {
      "Die With a Smile": "Die With A Smile",
      "Birds of a Feather": "BIRDS OF A FEATHER",
      "Espresso": "Espresso",
      "We Can't Be Friends (Wait for Your Love)": "we can't be friends (wait for your love)",
      "Beautiful Things": "Beautiful Things",
      "The Emptiness Machine": "The Emptiness Machine",
      "A Fragile Thing": "A Fragile Thing",
      "Dilemma": "Dilemma",
      "Dark Matter": "Dark Matter",
      "Nowhere to Go": "Nowhere To Run",
      "Not Like Us": "Not Like Us",
      "Timeless": "Timeless (feat Playboi Carti)",
      "Like That": "Like That",
      "Yeah Glo!": "Yeah Glo!",
      "Houdini": "Houdini",
      "Hypnotized": "Hypnotized (feat. Ellie Goulding)",
      "Addicted": "Addicted",
      "Abracadabra": "Abracadabra",
      "Take Five": "Take Five",
      "So What": "So What"
    };

    const newSongs = [
      { title: "Die With a Smile", artist: "Lady Gaga & Bruno Mars", genre: "pop" },
      { title: "Birds of a Feather", artist: "Billie Eilish", genre: "pop" },
      { title: "Espresso", artist: "Sabrina Carpenter", genre: "pop" },
      { title: "We Can't Be Friends (Wait for Your Love)", artist: "Ariana Grande", genre: "pop" },
      { title: "Beautiful Things", artist: "Benson Boone", genre: "pop" },
      { title: "The Emptiness Machine", artist: "Linkin Park", genre: "rock" },
      { title: "A Fragile Thing", artist: "The Cure", genre: "rock" },
      { title: "Dilemma", artist: "Green Day", genre: "rock" },
      { title: "Dark Matter", artist: "Pearl Jam", genre: "rock" },
      { title: "Nowhere to Go", artist: "Kings of Leon", genre: "rock" },
      { title: "Not Like Us", artist: "Kendrick Lamar", genre: "hiphop" },
      { title: "Timeless", artist: "The Weeknd & Playboi Carti", genre: "hiphop" },
      { title: "Like That", artist: "Future & Metro Boomin", genre: "hiphop" },
      { title: "Yeah Glo!", artist: "GloRilla", genre: "hiphop" },
      { title: "Houdini", artist: "Eminem", genre: "hiphop" },
      { title: "Hypnotized", artist: "Anyma & Ellie Goulding", genre: "electronic" },
      { title: "Addicted", artist: "Zerb & The Chainsmokers", genre: "electronic" },
      { title: "Abracadabra", artist: "Lady Gaga", genre: "electronic" },
      { title: "Take Five", artist: "The Dave Brubeck Quartet", genre: "jazz" },
      { title: "So What", artist: "Miles Davis", genre: "jazz" }
    ];

    let insertedCount = 0;

    for (const s of newSongs) {
      const baseName = exactFileNames[s.title];
      
      const songPath = fs.existsSync(path.join(songsDir, `${baseName}.mp3`))
        ? `uploads/songs/${baseName}.mp3`
        : 'uploads/songs/placeholder.mp3';

      let thumbPath = 'uploads/thumbnails/default.png';
      if (fs.existsSync(path.join(thumbsDir, `${baseName}.jpg`))) {
        thumbPath = `uploads/thumbnails/${baseName}.jpg`;
      } else if (fs.existsSync(path.join(thumbsDir, `${baseName}.jpeg`))) {
        thumbPath = `uploads/thumbnails/${baseName}.jpeg`;
      } else if (fs.existsSync(path.join(thumbsDir, `${baseName}.png`))) {
        thumbPath = `uploads/thumbnails/${baseName}.png`;
      }

      const existingSong = await Song.findOne({ title: s.title, artist: s.artist, uploadedBy: adminUser._id });
      
      if (!existingSong) {
        await Song.create({
          title: s.title,
          artist: s.artist,
          genre: s.genre,
          filePath: songPath,
          thumbnailPath: thumbPath,
          uploadedBy: adminUser._id, // Assign to admin
          plays: Math.floor(Math.random() * 500)
        });

        console.log(`✓ Inserted: ${s.artist} - ${s.title}`);
        insertedCount++;
      } else {
        console.log(`- Skipped (already exists): ${s.artist} - ${s.title}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Admin: ${adminUser.username}`);
    console.log(`  New Songs Inserted: ${insertedCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
