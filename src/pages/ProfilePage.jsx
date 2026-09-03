import { useState } from 'react';
import { Form, Button, Alert, Badge } from 'react-bootstrap';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const genreOptions = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'lofi', label: 'Lofi' },
  { value: 'folk', label: 'Folk' },
  { value: 'soul', label: 'Soul' },
  { value: 'country', label: 'Country' },
];

const ProfilePage = () => {
  const { user, updateGenres } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState(user?.genres || []);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateGenres(selectedGenres);
      setSuccess('Genre preferences updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update genres');
    }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-info">
            <h2>{user.username}</h2>
            <p className="profile-name">{user.firstName} {user.lastName}</p>
            {user.isAdmin && <Badge bg="warning" text="dark">Admin</Badge>}
          </div>
        </div>

        <div className="profile-section">
          <h4>Current Genre Preferences</h4>
          <div className="current-genres">
            {user.genres && user.genres.length > 0 ? (
              user.genres.map((g) => (
                <Badge key={g} bg="success" className="genre-badge">
                  {g}
                </Badge>
              ))
            ) : (
              <span className="text-muted">No genres selected</span>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h4>Update Genre Preferences</h4>

          {success && <Alert variant="success" className="mt-2">{success}</Alert>}
          {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

          <div className="genre-grid mt-3">
            {genreOptions.map((g) => (
              <div
                key={g.value}
                className={`genre-chip ${selectedGenres.includes(g.value) ? 'selected' : ''}`}
                onClick={() => handleGenreToggle(g.value)}
                id={`profile-genre-${g.value}`}
              >
                {g.label}
              </div>
            ))}
          </div>

          <Button
            className="auth-submit-btn mt-3"
            onClick={handleSave}
            disabled={saving}
            id="save-genres-btn"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
