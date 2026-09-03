import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AudioPlayer from './components/AudioPlayer';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import FavoritesPage from './pages/FavoritesPage';
import MyUploadsPage from './pages/MyUploadsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';

function App() {
  const [selectedGenre, setSelectedGenre] = useState('');

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
  };

  return (
    <AuthProvider>
      <PlayerProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <div className="app-body">
              <Sidebar
                selectedGenre={selectedGenre}
                onGenreSelect={handleGenreSelect}
              />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<HomePage selectedGenre={selectedGenre} />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route
                    path="/upload"
                    element={
                      <PrivateRoute>
                        <UploadPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <PrivateRoute>
                        <FavoritesPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/playlists"
                    element={
                      <PrivateRoute>
                        <PlaylistsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/playlists/:id"
                    element={
                      <PrivateRoute>
                        <PlaylistDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-uploads"
                    element={
                      <PrivateRoute>
                        <MyUploadsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ProfilePage />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
            <AudioPlayer />
          </div>
        </Router>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
