import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlay, FaTrash, FaList } from 'react-icons/fa';
import api from '../services/api';
import SongCard from '../components/SongCard';
import { usePlayer } from '../context/PlayerContext';

const PlaylistDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playSong } = usePlayer();

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const { data } = await api.get(`/playlists/${id}`);
      setPlaylist(data);
    } catch (err) {
      setError('Playlist not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      navigate('/playlists');
    } catch (err) {
      console.error('Failed to delete playlist', err);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      await api.put(`/playlists/${id}/remove`, { songId });
      setPlaylist({
        ...playlist,
        songs: playlist.songs.filter(s => s._id !== songId)
      });
    } catch (err) {
      console.error('Failed to remove song from playlist', err);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error || !playlist) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="playlist-detail-page px-3 py-2">
      <div className="d-flex align-items-end gap-4 mb-5">
        <div 
          className="playlist-cover shadow" 
          style={{ width: '200px', height: '200px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}
        >
          <FaList style={{ fontSize: '5rem', color: 'var(--text-muted)' }} />
        </div>
        <div className="pb-2">
          <p className="text-uppercase text-muted fw-bold mb-2 pt-3" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Playlist</p>
          <h1 className="fw-black mb-3" style={{ fontSize: '4rem', letterSpacing: '-2px' }}>{playlist.name}</h1>
          <p className="text-muted fw-bold m-0" style={{ fontSize: '0.9rem' }}>
            {playlist.songs.length} songs
          </p>
        </div>
      </div>

      <div className="d-flex gap-3 mb-4 align-items-center">
        <Button 
          className="rounded-circle p-0 play-all-btn" 
          style={{ width: '60px', height: '60px', background: 'var(--accent)', border: 'none', color: '#000' }}
          onClick={handlePlayAll}
          disabled={playlist.songs.length === 0}
        >
          <FaPlay style={{ fontSize: '1.5rem', marginLeft: '6px' }} />
        </Button>
        <Button 
          variant="outline-danger" 
          className="fw-bold px-4 rounded-pill border-2" 
          style={{ letterSpacing: '1px', fontSize: '0.9rem' }}
          onClick={handleDeletePlaylist}
        >
          DELETE PLAYLIST
        </Button>
      </div>

      <h4 className="border-bottom border-secondary pb-2 mb-4">Tracks</h4>
      
      <div className="song-grid">
        {playlist.songs.length === 0 ? (
          <p className="text-muted">No songs in this playlist. Add songs using the dropdown on any song card!</p>
        ) : (
          playlist.songs.map((song) => (
            <div key={song._id} style={{ position: 'relative' }}>
              <SongCard song={song} contextQueue={playlist.songs} />
              <Button 
                variant="danger" 
                size="sm" 
                className="position-absolute"
                style={{ top: '10px', left: '10px', zIndex: 10, borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}
                onClick={() => handleRemoveSong(song._id)}
                title="Remove from Playlist"
              >
                <FaTrash style={{ fontSize: '12px' }} />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistDetailPage;
