import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import api from '../services/api';
import SongCard from '../components/SongCard';

const FavoritesPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/favorites');
      setSongs(data);
    } catch {
      setSongs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteToggle = (songId, isFavorited) => {
    if (!isFavorited) {
      // Remove from list immediately (optimistic)
      setSongs((prev) => prev.filter((s) => s._id !== songId));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <h2 className="section-title">Your Favourites</h2>
      {songs.length === 0 ? (
        <p className="empty-state">No favourites yet. Start by clicking the heart icon on songs you love!</p>
      ) : (
        <div className="song-grid">
          {songs.map((song, idx) => (
            <SongCard
              key={song._id}
              song={song}
              songList={songs}
              index={idx}
              isFavorited={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
