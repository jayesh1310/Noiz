import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaList } from 'react-icons/fa';
import api from '../services/api';

const AddToPlaylistModal = ({ show, onHide, songId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (show) {
      fetchPlaylists();
      setShowCreate(false);
      setError('');
      setSuccess('');
    }
  }, [show]);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch (err) {
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/playlists/${playlistId}/add`, { songId });
      setSuccess(`Added to ${playlistName}`);
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to playlist');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError('Name is required');
      return;
    }
    setCreateLoading(true);
    setError('');
    try {
      // 1. Create Playlist
      const { data } = await api.post('/playlists', { name: newPlaylistName });
      // 2. Add song to it
      await api.put(`/playlists/${data._id}/add`, { songId });
      
      setSuccess(`Playlist created and song added!`);
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{showCreate ? 'Create & Add' : 'Add to Playlist'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {showCreate ? (
          <Form onSubmit={handleCreateAndAdd}>
            <Form.Group className="mb-3">
              <Form.Label>New Playlist Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="My Awesome Mix"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => { setShowCreate(false); setError(''); }}>
                Back
              </Button>
              <Button variant="success" type="submit" disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create & Add'}
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <Button 
              variant="outline-success" 
              className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowCreate(true)}
            >
              <FaPlus /> Create New Playlist
            </Button>
            
            <p className="text-muted fw-bold mb-2 ps-1">Save to...</p>
            {loading ? (
              <div className="text-center py-3"><Spinner animation="border" size="sm" variant="success" /></div>
            ) : playlists.length === 0 ? (
              <p className="text-muted text-center py-3">No playlists yet.</p>
            ) : (
              <ListGroup variant="flush">
                {playlists.map(p => (
                  <ListGroup.Item 
                    key={p._id} 
                    action 
                    className="bg-transparent text-white border-secondary d-flex align-items-center gap-3 py-3"
                    onClick={() => handleAddToPlaylist(p._id, p.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ background: '#333', padding: '10px', borderRadius: '4px' }}>
                      <FaList />
                    </div>
                    <strong>{p.name}</strong>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddToPlaylistModal;
