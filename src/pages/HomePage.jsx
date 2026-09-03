import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';
import HorizontalScroll from '../components/HorizontalScroll';

const HomePage = ({ selectedGenre }) => {
  const { user } = useAuth();
  const [fypSongs, setFypSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch favorite IDs for heart state
  const fetchFavoriteIds = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/favorites/ids');
      setFavoriteIds(data);
    } catch {
      setFavoriteIds([]);
    }
  };

  // Fetch main songs (FYP or genre filtered)
  const fetchSongs = async () => {
    setLoading(true);
    try {
      let songsData;
      if (selectedGenre) {
        const { data } = await api.get(`/songs?genre=${selectedGenre}`);
        songsData = data;
      } else if (user) {
        const { data } = await api.get('/songs/fyp');
        songsData = data;
      } else {
        const { data } = await api.get('/songs');
        songsData = data;
      }
      setFypSongs(songsData);
    } catch (err) {
      console.error('Error fetching songs:', err);
      setFypSongs([]);
    }
    setLoading(false);
  };

  // Fetch trending
  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/songs/trending');
      setTrendingSongs(data);
    } catch {
      setTrendingSongs([]);
    }
  };

  // Fetch recently played
  const fetchRecent = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/history/recent');
      setRecentSongs(data);
    } catch {
      setRecentSongs([]);
    }
  };

  useEffect(() => {
    fetchSongs();
    fetchTrending();
    fetchRecent();
    fetchFavoriteIds();
  }, [selectedGenre, user]);

  const handleFavoriteToggle = (songId, isFavorited) => {
    setFavoriteIds((prev) =>
      isFavorited ? [...prev, songId] : prev.filter((id) => id !== songId)
    );
  };

  const handleDelete = (songId) => {
    setFypSongs((prev) => prev.filter((s) => s._id !== songId));
    setTrendingSongs((prev) => prev.filter((s) => s._id !== songId));
    setRecentSongs((prev) => prev.filter((s) => s._id !== songId));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Recently Played */}
      {user && recentSongs.length > 0 && !selectedGenre && (
        <HorizontalScroll title="Recently Played">
          {recentSongs.map((song, idx) => (
            <SongCard
              key={song._id}
              song={song}
              songList={recentSongs}
              index={idx}
              isFavorited={favoriteIds.includes(song._id)}
              onFavoriteToggle={handleFavoriteToggle}
              onDelete={handleDelete}
            />
          ))}
        </HorizontalScroll>
      )}

      {/* Trending */}
      {trendingSongs.length > 0 && !selectedGenre && (
        <HorizontalScroll title="Trending">
          {trendingSongs.map((song, idx) => (
            <SongCard
              key={song._id}
              song={song}
              songList={trendingSongs}
              index={idx}
              isFavorited={favoriteIds.includes(song._id)}
              onFavoriteToggle={handleFavoriteToggle}
              onDelete={handleDelete}
            />
          ))}
        </HorizontalScroll>
      )}

      {/* Main song grid */}
      <div className="song-grid-section">
        <h2 className="section-title">
          {selectedGenre
            ? `${selectedGenre.charAt(0).toUpperCase() + selectedGenre.slice(1)} Songs`
            : user
            ? 'Recommended For You'
            : 'All Songs'}
        </h2>

        {fypSongs.length === 0 ? (
          <p className="empty-state">No songs found.</p>
        ) : (
          <div className="song-grid">
            {fypSongs.map((song, idx) => (
              <SongCard
                key={song._id}
                song={song}
                songList={fypSongs}
                index={idx}
                isFavorited={favoriteIds.includes(song._id)}
                onFavoriteToggle={handleFavoriteToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
