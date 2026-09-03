import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SongCard from '../components/SongCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setSongs([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/songs/search?q=${encodeURIComponent(query)}`);
        setSongs(data);
      } catch {
        setSongs([]);
      }
      setLoading(false);
    };

    const fetchFavIds = async () => {
      if (!user) return;
      try {
        const { data } = await api.get('/favorites/ids');
        setFavoriteIds(data);
      } catch {
        setFavoriteIds([]);
      }
    };

    search();
    fetchFavIds();
  }, [query, user]);

  const handleFavoriteToggle = (songId, isFavorited) => {
    setFavoriteIds((prev) =>
      isFavorited ? [...prev, songId] : prev.filter((id) => id !== songId)
    );
  };

  return (
    <div className="page-content">
      <h2 className="section-title">
        {query ? `Search results for "${query}"` : 'Search'}
      </h2>

      {loading ? (
        <div className="d-flex justify-content-center" style={{ paddingTop: '40px' }}>
          <Spinner animation="border" variant="light" />
        </div>
      ) : songs.length === 0 ? (
        <p className="empty-state">
          {query ? 'No songs found matching your search.' : 'Enter a search term to find songs.'}
        </p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
