
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!contactNumber.trim() && !whatsappNumber.trim()) {
      setError('Please provide at least one contact number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.post('/users/register', {
        name,
        email,
        password,
        contactNumber,
        whatsappNumber
      });

      setSuccess('Account created successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
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
          <h2>Create CampusFind Account</h2>
          <p>Create your account to use CampusFind.</p>

          <form onSubmit={handleRegister}>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

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
              minLength={8}
              required
            />

            <label htmlFor="contactNumber">
              Contact Number
            </label>
            <input
              id="contactNumber"
              type="tel"
              placeholder="03XXXXXXXXX"
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
            />

            <label htmlFor="whatsappNumber">
              WhatsApp Number
            </label>
            <input
              id="whatsappNumber"
              type="tel"
              placeholder="03XXXXXXXXX"
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
            />

            <p>
              Provide at least one number so other users can contact you
              when your lost item is found.
            </p>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button
              className="primary-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p>
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
