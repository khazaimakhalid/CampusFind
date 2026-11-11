
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    const updateUser = () => {
      const savedUser = localStorage.getItem('user');
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('authChanged', updateUser);

    return () => {
      window.removeEventListener('authChanged', updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    window.dispatchEvent(new Event('authChanged'));

    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand-link">
        <h2>CampusFind</h2>
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/?type=lost">Lost Items</NavLink>
        <NavLink to="/?type=found">Found Items</NavLink>

        {user ? (
          <>
            <Link to="/my-reports">My Reports</Link>
            <span className="user-name">Hi, {user.name}</span>
            <button
              type="button"
              className="login-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
