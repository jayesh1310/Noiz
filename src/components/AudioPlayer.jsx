import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaPlay, FaPause, FaStepForward, FaStepBackward,
  FaVolumeUp, FaVolumeMute, FaVolumeDown,
  FaHeart, FaRegHeart, FaRandom, FaMicrophoneAlt,
  FaEllipsisV, FaPlus
} from 'react-icons/fa';
import { TbRepeat, TbRepeatOnce, TbRepeatOff } from 'react-icons/tb';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AddToPlaylistModal from './AddToPlaylistModal';

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <button
    className="sp-icon-btn"
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

const AudioPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    hasError,
    repeatMode,
    shuffleOn,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = usePlayer();

  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Check favorite status when song changes
  useEffect(() => {
    const checkFav = async () => {
      if (!user || !currentSong) { setIsFavorited(false); return; }
      try {
        const { data } = await api.get('/favorites/ids');
        setIsFavorited(data.includes(currentSong._id));
      } catch {
        setIsFavorited(false);
      }
    };
    checkFav();
  }, [currentSong, user]);

  const toggleFavorite = async () => {
    if (!user || !currentSong) return;
    setIsFavorited(!isFavorited);
    try {
      const { data } = await api.post('/favorites/toggle', { songId: currentSong._id });
      setIsFavorited(data.isFavorited);
    } catch {
      setIsFavorited(!isFavorited); // revert
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <FaVolumeMute />;
    if (volume < 50) return <FaVolumeDown />;
    return <FaVolumeUp />;
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return <TbRepeatOnce />;
    if (repeatMode === 'all') return <TbRepeat />;
    return <TbRepeatOff />;
  };

  if (!currentSong) return null;

  return (
    <>
      <div className={`spotify-player ${currentSong ? 'visible' : ''}`} id="audio-player">
        {/* LEFT — Song Info + Heart */}
        <div className="sp-left">
          <img
            src={`/${currentSong.thumbnailPath}`}
            alt={currentSong.title}
            className="sp-thumb"
            onError={(e) => { e.target.src = '/uploads/thumbnails/default.png'; }}
          />
          <div className="sp-text">
            <span className="sp-title">{currentSong.title}</span>
            <span className="sp-artist">{currentSong.artist}</span>
          </div>
          {user && (
            <Dropdown drop="up" onClick={(e) => e.stopPropagation()}>
              <Dropdown.Toggle as={CustomToggle}>
                <FaEllipsisV />
              </Dropdown.Toggle>
              
              <Dropdown.Menu variant="dark" style={{ minWidth: '180px' }}>
                <Dropdown.Item onClick={toggleFavorite} className="d-flex align-items-center gap-2">
                  {isFavorited ? <FaHeart color="var(--favorite)" /> : <FaRegHeart />} 
                  {isFavorited ? 'Remove Favorite' : 'Add to Favorites'}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowPlaylistModal(true)} className="d-flex align-items-center gap-2">
                  <FaPlus /> Add to Playlist
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* CENTER — Controls + Progress */}
        <div className="sp-center">
          <div className="sp-controls">
            <button
              className={`sp-icon-btn sp-shuffle ${shuffleOn ? 'active' : ''}`}
              onClick={toggleShuffle}
              aria-label="Shuffle"
              id="shuffle-btn"
            >
              <FaRandom />
            </button>
            <button className="sp-icon-btn" onClick={prevSong} aria-label="Previous" id="prev-btn">
              <FaStepBackward />
            </button>
            <button
              className="sp-play-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              id="play-pause-btn"
            >
              {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
            </button>
            <button className="sp-icon-btn" onClick={nextSong} aria-label="Next" id="next-btn">
              <FaStepForward />
            </button>
            <button
              className={`sp-icon-btn sp-repeat ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={toggleRepeat}
              aria-label={`Repeat: ${repeatMode}`}
              id="repeat-btn"
              title={`Repeat: ${repeatMode}`}
            >
              {getRepeatIcon()}
            </button>
          </div>
          <div className="sp-progress-row">
            {hasError ? (
              <span className="player-error">⚠ No audio file available</span>
            ) : (
              <>
                <span className="sp-time">{formatTime(currentTime)}</span>
                <div className="sp-progress-wrapper">
                  <input
                    type="range"
                    className="sp-progress"
                    min="0"
                    max="100"
                    value={progressPercent}
                    onChange={(e) => {
                      if (duration) seek((e.target.value / 100) * duration);
                    }}
                    style={{ '--progress': `${progressPercent}%` }}
                    id="progress-slider"
                  />
                </div>
                <span className="sp-time">{formatTime(duration)}</span>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — Lyrics, Volume */}
        <div className="sp-right">
          <button
            className={`sp-icon-btn sp-lyrics-btn ${showLyrics ? 'active' : ''}`}
            onClick={() => setShowLyrics(!showLyrics)}
            aria-label="Lyrics"
            id="lyrics-btn"
            title="Lyrics"
          >
            <FaMicrophoneAlt />
          </button>
          <button className="sp-icon-btn" onClick={toggleMute} aria-label="Mute toggle" id="mute-btn">
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            className="sp-volume"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={{ '--progress': `${volume}%` }}
            id="volume-slider"
          />
        </div>
      </div>

      <AddToPlaylistModal
        show={showPlaylistModal}
        onHide={() => setShowPlaylistModal(false)}
        songId={currentSong._id}
      />
    </>
  );
};

export default AudioPlayer;
