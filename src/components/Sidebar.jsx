import React, { useState } from 'react';
import { Nav, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaHome, FaHeart, FaCloudUploadAlt, FaMusic, FaCompactDisc,
  FaGuitar, FaDrum, FaHeadphones, FaRecordVinyl, FaList
} from 'react-icons/fa';
import { GiSaxophone, GiViolin, GiCoffeeCup, GiCowboyBoot, GiMicrophone } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';

const genres = [
  { value: 'pop', label: 'Pop', icon: <GiMicrophone /> },
  { value: 'rock', label: 'Rock', icon: <FaGuitar /> },
  { value: 'hiphop', label: 'Hip Hop', icon: <FaDrum /> },
  { value: 'electronic', label: 'Electronic', icon: <FaHeadphones /> },
  { value: 'jazz', label: 'Jazz', icon: <GiSaxophone /> },
  { value: 'classical', label: 'Classical', icon: <GiViolin /> },
  { value: 'lofi', label: 'Lofi', icon: <GiCoffeeCup /> },
  { value: 'folk', label: 'Folk / Indie', icon: <FaRecordVinyl /> },
  { value: 'soul', label: 'Soul', icon: <FaCompactDisc /> },
  { value: 'country', label: 'Country', icon: <GiCowboyBoot /> },
];

const Sidebar = ({ selectedGenre, onGenreSelect }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [showLegal, setShowLegal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleGenreClick = (genre) => {
    onGenreSelect(genre);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <>
      <div className="app-sidebar">
        <div className="sidebar-section">
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`} id="nav-home">
              <FaHome className="sidebar-icon" /> Home
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/favorites" className={`sidebar-link ${location.pathname === '/favorites' ? 'active' : ''}`} id="nav-favorites">
                  <FaHeart className="sidebar-icon" /> Favourites
                </Nav.Link>
                <Nav.Link as={Link} to="/playlists" className={`sidebar-link ${location.pathname.startsWith('/playlists') ? 'active' : ''}`} id="nav-playlists">
                  <FaList className="sidebar-icon" /> Playlists
                </Nav.Link>
                <Nav.Link as={Link} to="/my-uploads" className={`sidebar-link ${location.pathname === '/my-uploads' ? 'active' : ''}`} id="nav-my-uploads">
                  <FaMusic className="sidebar-icon" /> My Uploads
                </Nav.Link>
                <Nav.Link as={Link} to="/upload" className={`sidebar-link ${location.pathname === '/upload' ? 'active' : ''}`} id="nav-upload">
                  <FaCloudUploadAlt className="sidebar-icon" /> Upload Song
                </Nav.Link>
              </>
            )}
          </Nav>
        </div>

        <div className="sidebar-section genre-section">
          <h6 className="sidebar-heading">
            <FaMusic className="me-2" />
            Genres
          </h6>
          <Nav className="flex-column genre-list">
            <Nav.Link className={`genre-item ${!selectedGenre ? 'active' : ''}`} onClick={() => handleGenreClick('')} id="genre-all">
              All Genres
            </Nav.Link>
            {genres.map((g) => (
              <Nav.Link key={g.value} className={`genre-item ${selectedGenre === g.value ? 'active' : ''}`} onClick={() => handleGenreClick(g.value)} id={`genre-${g.value}`}>
                <span className="genre-icon">{g.icon}</span>
                {g.label}
              </Nav.Link>
            ))}
          </Nav>
        </div>

        <div className="sidebar-footer">
          <a href="#" onClick={(e) => { e.preventDefault(); setShowLegal(true); }}>Legal</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}>Privacy</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowAbout(true); }}>About</a>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Legal Modal */}
      <Modal show={showLegal} onHide={() => setShowLegal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Legal Stuff (That We Definitely Read)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>By using this app, you agree to support Bajrang Dal, you also agree RCB is going to three-peat in IPL, and donate 10% of you income to PM CARES fund. Always MODI paglu 👉👈</p>
          <p>This is a college project. Don't sue us, we're broke and running on caffeine and Claude opus.</p>
          <p>All songs are for educational purposes only. If you're a record label lawyer, pls no. We'll take it down. We promise. 🥺</p>
          <p><strong>TL;DR:</strong> You exist = you agreed. No take-backsies.</p>
        </Modal.Body>
      </Modal>

      {/* Privacy Modal */}
      <Modal show={showPrivacy} onHide={() => setShowPrivacy(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Privacy Policy (We're Watching You)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>We collect: Your name, email, what songs you play at 3 AM (sus), and how many times you looped "Modi Hai Toh Mumkin Hai" (it's okay, we did too).</p>
          <p>We share data with: Absolutely nobody, because we don't know how to sell data. But if we figure it out... 💰</p>
          <p>Cookies? Yes, we use them. The digital kind. The edible kind you have to supply yourself.</p>
          <p>Your data is as safe as your Duolingo streak after a 7-day vacation.</p>
          <p>By using Noiz, you consent to being judged by our algorithm (it has attachment issues).</p>
        </Modal.Body>
      </Modal>

      {/* About Modal */}
      <Modal show={showAbout} onHide={() => setShowAbout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>About Us (The Brains Behind the Bloat)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Noiz was forged in the fires of Mount Doom (aka a cramped hostel room at 4 AM) by four sleep-deprived students who thought "How hard can a full-stack app be?" Narrator: It was hard.</p>
          <p>We run on: MongoDB (because tables are for furniture), Express (fast, like our deadline panic), React (more hooks than a fishing tackle box), and Node (the only thing keeping us from dropping out).</p>
          <p>Special thanks to Claude Opus and Gemini 3.0.</p>
          <p>This app is 10% music, 90% "please just work for the demo."</p>
          <p><strong>Motto:</strong> <em>If it compiles, ship it.</em> 🚢</p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;
