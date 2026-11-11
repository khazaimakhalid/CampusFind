
import { useState } from 'react';
import {
  Link,
  useNavigate,
  useLocation
} from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/users/login', {
        email,
        password
      });

      const { user, accessToken } = response.data.data;

      // Save login information
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Update Navbar
      window.dispatchEvent(new Event('authChanged'));

      // Redirect to originally requested page
      navigate(redirectPath, { replace: true });

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="report-section">
        <div className="report-card">
          <h2>Login to CampusFind</h2>
          <p>Login to access your CampusFind account.</p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <p className="error-message">{error}</p>
            )}

            <button
              className="primary-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
