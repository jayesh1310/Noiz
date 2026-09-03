import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import api from '../services/api';
import SongCard from '../components/SongCard';

const MyUploadsPage = () => {
  const [songs, setSongs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/songs/my-uploads');
      setSongs(data);
    } catch {
      setSongs([]);
    }
    setLoading(false);
  };

  const fetchFavoriteIds = async () => {
    try {
      const { data } = await api.get('/favorites/ids');
      setFavoriteIds(data);
    } catch {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchFavoriteIds();
  }, []);

  const handleDelete = (songId) => {
    setSongs((prev) => prev.filter((s) => s._id !== songId));
  };

  const handleFavoriteToggle = (songId, isFavorited) => {
    setFavoriteIds((prev) =>
      isFavorited ? [...prev, songId] : prev.filter((id) => id !== songId)
    );
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
      <h2 className="section-title">My Uploads</h2>
      {songs.length === 0 ? (
        <p className="empty-state">No uploads yet. Upload your first song!</p>
      ) : (
        <div className="song-grid">
          {songs.map((song, idx) => (
            <SongCard
              key={song._id}
              song={song}
              songList={songs}
              index={idx}
              isFavorited={favoriteIds.includes(song._id)}
              onFavoriteToggle={handleFavoriteToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyUploadsPage;
