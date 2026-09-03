import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PlaylistsPage = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [error, setError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    setCreateLoading(true);
    try {
      const { data } = await api.post('/playlists', { name: newPlaylistName });
      setPlaylists([data, ...playlists]);
      setShowCreate(false);
      setNewPlaylistName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(playlists.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete playlist', err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div className="playlists-page px-3 py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="scroll-title mb-0">
          <FaList className="me-2" /> My Playlists
        </h2>
        <Button 
          variant="success" 
          className="d-flex align-items-center gap-2"
          onClick={() => setShowCreate(true)}
          style={{ background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 'bold' }}
        >
          <FaPlus /> New Playlist
        </Button>
      </div>

      <div className="song-grid">
        {playlists.length === 0 ? (
          <p className="text-muted">You haven't created any playlists yet.</p>
        ) : (
          playlists.map((playlist) => (
            <Link to={`/playlists/${playlist._id}`} key={playlist._id} style={{ textDecoration: 'none' }}>
              <div className="song-card">
                <div className="song-card-img-wrapper" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaList style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
                  <button className="delete-btn" onClick={(e) => handleDelete(e, playlist._id)}>
                    <FaTrash />
                  </button>
                </div>
                <div className="song-card-info">
                  <p className="song-card-title">{playlist.name}</p>
                  <p className="song-card-artist">{playlist.songs?.length || 0} songs</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Modal show={showCreate} onHide={() => { setShowCreate(false); setError(''); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleCreatePlaylist}>
            <Form.Group>
              <Form.Label>Playlist Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="My Awesome Mix..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-4 gap-2">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="success" type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PlaylistsPage;
