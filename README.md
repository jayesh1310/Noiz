# VAP Music - MERN Stack

A modern music streaming web application built with MongoDB, Express, React, and Node.js.

## Tech Stack

- **Frontend:** React 19, Vite, React-Bootstrap, Axios, React Router
- **Backend:** Node.js, Express, Mongoose, JWT, Multer, Bcrypt
- **Database:** MongoDB

## Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (or use the existing one):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/musicwebapp
JWT_SECRET=vap_music_app_super_secret_key_2024
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the App

Navigate to **http://localhost:5173**

## Default Accounts

| Username | Password | Role |
|----------|----------|------|
| `Qusai_01` | `qusai123` | Admin |
| `demo_user` | `demo1234` | User |

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Current user | Yes |
| PUT | `/api/auth/genres` | Update genres | Yes |
| GET | `/api/songs` | All songs (filter: `?genre=`, `?artist=`) | No |
| GET | `/api/songs/fyp` | Personalized feed | Yes |
| GET | `/api/songs/trending` | Most favorited | No |
| GET | `/api/songs/my-uploads` | User's uploads | Yes |
| GET | `/api/songs/search?q=` | Search | No |
| POST | `/api/songs` | Upload song | Yes |
| DELETE | `/api/songs/:id` | Delete song | Yes |
| POST | `/api/favorites/toggle` | Toggle favorite | Yes |
| GET | `/api/favorites` | User's favorites | Yes |
| GET | `/api/favorites/ids` | Favorite song IDs | Yes |
| POST | `/api/history` | Record play | Yes |
| GET | `/api/history/recent` | Recent plays | Yes |

## Features

- JWT authentication with secure password hashing
- Song upload with Multer (MP3 + thumbnail)
- Personalized "For You" feed based on genre preferences
- Favorites with optimistic UI updates
- Persistent audio player with queue management
- Search by song title or artist
- Genre filtering
- Listening history tracking
- Admin song deletion
- Responsive dark theme UI
