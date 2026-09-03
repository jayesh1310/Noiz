import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import api from '../services/api';

const PlayerContext = createContext(null);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [shuffleOn, setShuffleOn] = useState(false);
  const lastVolume = useRef(100);
  const playRecordedRef = useRef(null);
  const errorCountRef = useRef(0);

  // Create audio element only once
  if (!audioRef.current) {
    audioRef.current = new Audio();
  }
  const audio = audioRef.current;

  // Helper to play a song by reference
  const loadAndPlay = (song) => {
    if (!song) return;
    setCurrentSong(song);
    if (!song.filePath || song.filePath === 'uploads/songs/placeholder.mp3') {
      setHasError(true);
      setIsPlaying(false);
      return;
    }
    setHasError(false);
    audio.src = `/${song.filePath}`;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  // Get next index based on shuffle
  const getNextIndex = (currentIdx, queueLen) => {
    if (shuffleOn) {
      if (queueLen <= 1) return 0;
      let rand;
      do { rand = Math.floor(Math.random() * queueLen); } while (rand === currentIdx);
      return rand;
    }
    return (currentIdx + 1) % queueLen;
  };

  // Setup audio event listeners (stable — runs once)
  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleCanPlay = () => {
      setHasError(false);
      errorCountRef.current = 0;
    };
    const handleEnded = () => {
      // Check repeat mode via DOM-less approach
      setRepeatMode((rm) => {
        if (rm === 'one') {
          // Repeat current song
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return rm;
        }
        // Move to next
        setCurrentIndex((prev) => {
          setQueue((q) => {
            if (q.length === 0) return q;
            setShuffleOn((sh) => {
              let nextIdx;
              if (sh) {
                if (q.length <= 1) nextIdx = 0;
                else {
                  do { nextIdx = Math.floor(Math.random() * q.length); } while (nextIdx === prev);
                }
              } else {
                nextIdx = (prev + 1) % q.length;
              }

              // If repeat is off and we've looped back to start, stop
              if (rm === 'off' && nextIdx === 0 && prev === q.length - 1 && !sh) {
                setIsPlaying(false);
                return sh;
              }

              const nextSong = q[nextIdx];
              if (nextSong) {
                setCurrentSong(nextSong);
                if (nextSong.filePath && nextSong.filePath !== 'uploads/songs/placeholder.mp3') {
                  audio.src = `/${nextSong.filePath}`;
                  audio.play().catch(() => {});
                } else {
                  setHasError(true);
                  setIsPlaying(false);
                }
              }
              setCurrentIndex(nextIdx);
              return sh;
            });
            return q;
          });
          return prev;
        });
        return rm;
      });
    };
    const handleError = () => {
      errorCountRef.current += 1;
      setHasError(true);
      if (errorCountRef.current >= 3) {
        setIsPlaying(false);
        return;
      }
      // Try next song
      setCurrentIndex((prev) => {
        setQueue((q) => {
          if (q.length <= 1) {
            setIsPlaying(false);
            return q;
          }
          const nextIdx = (prev + 1) % q.length;
          const nextSong = q[nextIdx];
          if (nextSong) {
            setCurrentSong(nextSong);
            if (nextSong.filePath && nextSong.filePath !== 'uploads/songs/placeholder.mp3') {
              audio.src = `/${nextSong.filePath}`;
              audio.play().catch(() => {});
            } else {
              setHasError(true);
              setIsPlaying(false);
            }
          }
          return q;
        });
        return (prev + 1) % Math.max(1, queue.length);
      });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Record play history
  const recordPlay = useCallback((songId) => {
    if (playRecordedRef.current === songId) return;
    playRecordedRef.current = songId;
    const token = localStorage.getItem('token');
    if (token && songId) {
      api.post('/history', { songId }).catch(() => {});
    }
    setTimeout(() => {
      if (playRecordedRef.current === songId) playRecordedRef.current = null;
    }, 30000);
  }, []);

  // Play a specific song
  const playSong = useCallback(
    (song, newQueue = null, index = null) => {
      errorCountRef.current = 0;
      setHasError(false);
      if (newQueue) {
        setQueue(newQueue);
        const idx = index !== null ? index : newQueue.findIndex((s) => s._id === song._id);
        setCurrentIndex(idx >= 0 ? idx : 0);
      }
      setCurrentSong(song);
      if (!song.filePath || song.filePath === 'uploads/songs/placeholder.mp3') {
        setHasError(true);
        setIsPlaying(false);
        return;
      }
      audio.src = `/${song.filePath}`;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      recordPlay(song._id);
    },
    [audio, recordPlay]
  );

  const togglePlay = useCallback(() => {
    if (!currentSong || hasError) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audio, currentSong, isPlaying, hasError]);

  const nextSong = useCallback(() => {
    if (queue.length === 0) return;
    errorCountRef.current = 0;
    const nextIdx = getNextIndex(currentIndex, queue.length);
    setCurrentIndex(nextIdx);
    const next = queue[nextIdx];
    if (next) {
      setCurrentSong(next);
      if (!next.filePath || next.filePath === 'uploads/songs/placeholder.mp3') {
        setHasError(true);
        setIsPlaying(false);
        return;
      }
      setHasError(false);
      audio.src = `/${next.filePath}`;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      recordPlay(next._id);
    }
  }, [queue, currentIndex, audio, recordPlay, shuffleOn]);

  const prevSong = useCallback(() => {
    if (queue.length === 0) return;
    errorCountRef.current = 0;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIdx);
    const prev = queue[prevIdx];
    if (prev) {
      setCurrentSong(prev);
      if (!prev.filePath || prev.filePath === 'uploads/songs/placeholder.mp3') {
        setHasError(true);
        setIsPlaying(false);
        return;
      }
      setHasError(false);
      audio.src = `/${prev.filePath}`;
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      recordPlay(prev._id);
    }
  }, [queue, currentIndex, audio, recordPlay]);

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setCurrentTime(time);
  }, [audio]);

  const setVolume = useCallback((val) => {
    const v = Number(val);
    audio.volume = v / 100;
    setVolumeState(v);
    lastVolume.current = v;
    setIsMuted(v === 0);
  }, [audio]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      const restored = lastVolume.current || 100;
      audio.volume = restored / 100;
      setVolumeState(restored);
      setIsMuted(false);
    } else {
      lastVolume.current = volume;
      audio.volume = 0;
      setVolumeState(0);
      setIsMuted(true);
    }
  }, [audio, isMuted, volume]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleOn((prev) => !prev);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        currentIndex,
        isPlaying,
        volume,
        isMuted,
        currentTime,
        duration,
        hasError,
        repeatMode,
        shuffleOn,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
