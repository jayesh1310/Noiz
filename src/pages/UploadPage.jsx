import { useState } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt } from 'react-icons/fa';
import api from '../services/api';

const genreOptions = [
  { value: 'lofi', label: 'Lofi' },
  { value: 'pop', label: 'Pop' },
  { value: 'hiphop', label: 'Hip Hop' },
  { value: 'folk', label: 'Folk / Indie' },
  { value: 'classical', label: 'Classical' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'soul', label: 'Soul' },
  { value: 'country', label: 'Country' },
  { value: 'rock', label: 'Rock' },
];

const UploadPage = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [songFile, setSongFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !genre || !songFile || !thumbnailFile) {
      setError('All fields are required');
      return;
    }

    // Client-side file validation
    if (!['audio/mpeg', 'audio/mp3'].includes(songFile.type)) {
      setError('Song must be an MP3 file');
      return;
    }
    if (songFile.size > 15 * 1024 * 1024) {
      setError('Song file must be under 15MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(thumbnailFile.type)) {
      setError('Thumbnail must be JPG or PNG');
      return;
    }
    if (thumbnailFile.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    formData.append('genre', genre);
    formData.append('songFile', songFile);
    formData.append('thumbnailFile', thumbnailFile);

    setUploading(true);
    try {
      await api.post('/songs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total);
          setProgress(pct);
        },
      });
      setSuccess('Song uploaded successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-card">
        <div className="upload-header">
          <FaCloudUploadAlt className="upload-icon" />
          <h2>Upload Song</h2>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Song Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter song title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="auth-input"
              id="upload-title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Artist Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Leave blank to use your name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="auth-input"
              id="upload-artist"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Genre</Form.Label>
            <Form.Select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="auth-input"
              id="upload-genre"
              required
            >
              <option value="" disabled>Select a genre</option>
              {genreOptions.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Song File (.mp3)</Form.Label>
            <Form.Control
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={(e) => setSongFile(e.target.files[0])}
              className="auth-input file-input"
              id="upload-song-file"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Thumbnail (.jpg, .jpeg, .png)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className="auth-input file-input"
              id="upload-thumbnail-file"
              required
            />
          </Form.Group>

          {uploading && (
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              className="mb-3 upload-progress"
              variant="success"
            />
          )}

          <Button
            type="submit"
            className="auth-submit-btn w-100"
            disabled={uploading}
            id="upload-submit"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default UploadPage;
