// frontend/src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/bookings/notifications/all').then(({ data }) => {
        setNotifs(data);
        setNotifCount(data.filter(n => !n.is_read).length);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markRead = () => {
    if (notifCount > 0) {
      api.put('/bookings/notifications/read').then(() => {
        setNotifCount(0);
        setNotifs(n => n.map(x => ({ ...x, is_read: true })));
      }).catch(() => {});
    }
    setNotifOpen(!notifOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">🎬</div>
          <span className="logo-text">CinePulse</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/movies" className={location.pathname.startsWith('/movies') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Movies</Link>
          {user && <Link to="/bookings" className={location.pathname === '/bookings' ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Bookings</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Admin</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="notif-wrap">
                <button className="btn btn-ghost btn-icon" onClick={markRead} title="Notifications">
                  🔔
                  {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
                </button>
                {notifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header"><span>Notifications</span><button onClick={() => setNotifOpen(false)}>✕</button></div>
                    {notifs.length === 0 ? (
                      <div className="notif-empty">No notifications yet</div>
                    ) : (
                      notifs.slice(0, 6).map(n => (
                        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-msg">{n.message}</div>
                          <div className="notif-time">{new Date(n.created_at).toLocaleDateString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="user-menu">
                <button className="user-btn">
                  <span className="user-avatar">{user.name[0].toUpperCase()}</span>
                  <span className="user-name">{user.name.split(' ')[0]}</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                  <Link to="/bookings" onClick={() => setMenuOpen(false)}>🎟️ My Bookings</Link>
                  <hr />
                  <button onClick={handleLogout}>🚪 Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </nav>
  );
}
