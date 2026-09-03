import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaMusic, FaUser, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('user'); // 'user' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = await login(username.trim(), password, loginType);

      // If admin login tab is selected, verify that the user is actually an admin
      if (loginType === 'admin' && !userData.isAdmin) {
        setError('This account does not have admin privileges');
        setLoading(false);
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay" id="login-overlay">
      <div className="login-modal-card">
        <div className="auth-header">
          <FaMusic className="auth-logo" />
          <h2>Log In to Noiz</h2>
        </div>

        {/* Login Type Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${loginType === 'user' ? 'active' : ''}`}
            onClick={() => { setLoginType('user'); setError(''); }}
            id="tab-user"
          >
            <FaUser className="me-2" />
            User Login
          </button>
          <button
            className={`login-tab ${loginType === 'admin' ? 'active' : ''}`}
            onClick={() => { setLoginType('admin'); setError(''); }}
            id="tab-admin"
          >
            <FaShieldAlt className="me-2" />
            Admin Login
          </button>
        </div>

        {loginType === 'admin' && (
          <div className="admin-notice">
            <FaShieldAlt className="me-1" />
            Admin access — elevated privileges
          </div>
        )}

        {error && <Alert variant="danger" className="auth-alert">{error}</Alert>}

        <Form onSubmit={handleSubmit} className="auth-form">
          <Form.Group className="mb-3">
            <Form.Label>{loginType === 'admin' ? 'Admin Username' : 'Username'}</Form.Label>
            <Form.Control
              type="text"
              placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              id="login-username"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4 position-relative">
            <Form.Label>Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                id="login-password"
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

          <Button
            type="submit"
            className={`auth-submit-btn w-100 ${loginType === 'admin' ? 'admin-submit' : ''}`}
            disabled={loading}
            id="login-submit"
          >
            {loading
              ? 'Logging in...'
              : loginType === 'admin'
              ? 'Log In as Admin'
              : 'Log In'}
          </Button>
        </Form>

        {loginType === 'user' && (
          <p className="auth-footer-text">
            Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
