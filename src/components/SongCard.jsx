import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaPlay, FaHeart, FaRegHeart, FaTrash, FaEllipsisV, FaPlus } from 'react-icons/fa';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddToPlaylistModal from './AddToPlaylistModal';

const DEFAULT_THUMB = '/uploads/thumbnails/default.png';

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <button
    className="fav-btn"
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }}
  >
    {children}
  </button>
));

const SongCard = ({ song, songList, index, isFavorited, onFavoriteToggle, onDelete }) => {
  const { playSong } = usePlayer();
  const { user } = useAuth();
  const [favState, setFavState] = useState(isFavorited);
  const [imgError, setImgError] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song, songList, index);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) return;

    setFavState(!favState);
    try {
      const { data } = await api.post('/favorites/toggle', { songId: song._id });
      setFavState(data.isFavorited);
      if (onFavoriteToggle) onFavoriteToggle(song._id, data.isFavorited);
    } catch {
      setFavState(favState);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${song.title}"?`)) {
      try {
        await api.delete(`/songs/${song._id}`);
        if (onDelete) onDelete(song._id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete song');
      }
    }
  };

  const canDelete =
    user &&
    (user.isAdmin ||
      (song.uploadedBy &&
        (song.uploadedBy._id === user._id ||
          song.uploadedBy === user._id)));

  const thumbnailSrc = imgError
    ? DEFAULT_THUMB
    : song.thumbnailPath
    ? `/${song.thumbnailPath}`
    : DEFAULT_THUMB;

  return (
    <>
      <div className="song-card" id={`song-${song._id}`}>
        <div className="song-card-img-wrapper">
          <img
            src={thumbnailSrc}
            alt={song.title}
            className="song-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          <div className="song-card-overlay">
            <button className="play-btn" onClick={handlePlay} aria-label="Play song">
              <FaPlay />
            </button>
          </div>
          
          {user && (
            <Dropdown onClick={(e) => e.stopPropagation()} className="position-absolute" style={{ bottom: '8px', left: '8px' }}>
              <Dropdown.Toggle as={CustomToggle}>
                <FaEllipsisV />
              </Dropdown.Toggle>

              <Dropdown.Menu variant="dark" style={{ minWidth: '180px' }}>
                <Dropdown.Item onClick={handleFavorite} className="d-flex align-items-center gap-2">
                  {favState ? <FaHeart color="var(--favorite)" /> : <FaRegHeart />} 
                  {favState ? 'Remove Favorite' : 'Add to Favorites'}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowPlaylistModal(true)} className="d-flex align-items-center gap-2">
                  <FaPlus /> Add to Playlist
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

          {canDelete && onDelete && (
            <button className="delete-btn" onClick={handleDelete} aria-label="Delete song">
              <FaTrash />
            </button>
          )}
        </div>
        <div className="song-card-info">
          <h3 className="song-card-title">{song.title}</h3>
          <p className="song-card-artist">{song.artist}</p>
        </div>
      </div>

      <AddToPlaylistModal 
        show={showPlaylistModal} 
        onHide={() => setShowPlaylistModal(false)}
        songId={song._id}
      />
    </>
  );
};

export default SongCard;
