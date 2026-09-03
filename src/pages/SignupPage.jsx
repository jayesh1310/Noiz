import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaMusic, FaEye, FaEyeSlash } from 'react-icons/fa';
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

const SignupPage = () => {
  const [step, setStep] = useState(1); // Step 1: credentials, Step 2: genres
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');

    const { username, firstName, lastName, password } = formData;

    if (!username.trim() || !firstName.trim() || !lastName.trim() || !password) {
      setError('All fields are required');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/.test(username)) {
      setError(
        'Username must be 3-20 characters, start with a letter or underscore, and contain only letters, numbers, or underscores.'
      );
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setStep(2);
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await signup({ ...formData, genres: selectedGenres });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FaMusic className="auth-logo" />
          <h2>{step === 1 ? 'Sign Up' : 'Select Your Genres'}</h2>
        </div>

        {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}

        {step === 1 ? (
          <Form onSubmit={handleStep1} className="auth-form">
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className="auth-input"
                id="signup-username"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="auth-input"
                id="signup-firstname"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="auth-input"
                id="signup-lastname"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4 position-relative">
              <Form.Label>Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  id="signup-password"
                  minLength={8}
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  className="position-absolute border-0 bg-transparent"
                  style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </Form.Group>

            <Button type="submit" className="auth-submit-btn w-100" id="signup-next">
              Next
            </Button>
          </Form>
        ) : (
          <div className="genre-selection">
            <p className="genre-subtitle">Help us build a perfect feed for you.</p>
            <div className="genre-grid">
              {genreOptions.map((g) => (
                <div
                  key={g.value}
                  className={`genre-chip ${selectedGenres.includes(g.value) ? 'selected' : ''}`}
                  onClick={() => handleGenreToggle(g.value)}
                  id={`genre-chip-${g.value}`}
                >
                  {g.label}
                </div>
              ))}
            </div>
            <div className="genre-actions">
              <button
                className="skip-btn"
                onClick={handleSignup}
                disabled={loading}
              >
                Skip &gt;
              </button>
              <Button
                className="auth-submit-btn"
                onClick={handleSignup}
                disabled={loading}
                id="signup-finish"
              >
                {loading ? 'Creating account...' : 'Finish'}
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Log In</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
