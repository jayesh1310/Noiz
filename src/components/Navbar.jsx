import { useState } from 'react';
import { Navbar as BSNavbar, Container, Form, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaMusic, FaUser, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar className="app-navbar" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/" className="brand-logo">
          <FaMusic className="brand-icon" />
          <span>Noiz</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          {user && (
            <Form className="d-flex mx-auto search-form" onSubmit={handleSearch}>
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="search"
                  placeholder="Search songs or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  id="navbar-search"
                />
              </div>
            </Form>
          )}

          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                {user.isAdmin && (
                  <span className="admin-badge" id="admin-badge">
                    <FaShieldAlt className="me-1" />
                    Admin
                  </span>
                )}
                <Nav.Link as={Link} to="/profile" className="nav-user">
                  <FaUser className="me-1" />
                  {user.username}
                </Nav.Link>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="logout-btn"
                  id="logout-btn"
                >
                  <FaSignOutAlt className="me-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/signup" className="nav-auth-link">
                  Sign Up
                </Nav.Link>
                <Button
                  as={Link}
                  to="/login"
                  variant="light"
                  size="sm"
                  className="login-nav-btn"
                  id="login-nav-btn"
                >
                  Log In
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
