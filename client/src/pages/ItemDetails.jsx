
import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';
import './ItemDetails.css';

function ItemDetails() {
  const { id } = useParams();

  const currentUser = JSON.parse(
    localStorage.getItem('user') || 'null'
  );

  const token = localStorage.getItem('token');

  const [item, setItem] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactError, setContactError] = useState('');

  // Fetch item details
  useEffect(() => {
    if (!token) return;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/items');

        const data = response.data.data;
        const items = Array.isArray(data) ? data : data.items;

        const foundItem = items?.find(
          (entry) => entry._id === id
        );

        if (!foundItem) {
          setError('Item not found');
          return;
        }

        setItem(foundItem);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Unable to load item details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, token]);

  const isFinder =
    currentUser?._id &&
    item?.reportedBy?._id &&
    currentUser._id === item.reportedBy._id;

  // Fetch contact details for Found items
  useEffect(() => {
    if (!item || item.type !== 'found' || !token || isFinder) {
      setContact(null);
      setContactError('');
      return;
    }

    const fetchContact = async () => {
      try {
        setContactLoading(true);
        setContactError('');

        const response = await api.get(`/items/${id}/contact`);

        setContact(response.data.data);
      } catch (error) {
        setContactError(
          error.response?.data?.message ||
          'Unable to load contact details.'
        );
      } finally {
        setContactLoading(false);
      }
    };

    fetchContact();
  }, [item, id, token, isFinder]);

  const getItemIcon = (category) => {
    const icons = {
      Bags: '🎒',
      Keys: '🔑',
      Books: '📚',
      Electronics: '💻',
      Clothing: '👕',
      Documents: '📄',
      Accessories: '⌚',
      Other: '📦'
    };

    return icons[category] || '📦';
  };

  const getWhatsAppNumber = (number) => {
    let digits = number.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = `92${digits.slice(1)}`;
    } else if (!digits.startsWith('92')) {
      digits = `92${digits}`;
    }

    return digits;
  };

  // Redirect logged-out users to Login
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `/items/${id}` }}
      />
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="details-section">
          <h2>Loading item details...</h2>
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <Navbar />
        <div className="details-section">
          <h2>{error || 'Item not found'}</h2>
          <Link to="/">Back to Home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="details-section">
        <Link className="back-btn" to="/">
          ← Back to Items
        </Link>

        <div className="details-card">
          <div className="item-icon">
            {getItemIcon(item.category)}
          </div>

          <span className={item.type === 'lost' ? 'lost-label' : 'found-label'}>
            {item.type.toUpperCase()}
          </span>

          <h2>{item.title}</h2>

          <p>Category: {item.category}</p>
          <p>Description: {item.description}</p>
          <p>Location: {item.location}</p>

          <p>
            Date: {new Date(item.dateLostFound).toLocaleDateString()}
          </p>

          {item.type === 'lost' && (
            currentUser?._id !== item.reportedBy?._id && (
              <Link
                className="primary-btn"
                to={`/found-request/${item._id}`}
              >
                I Found This Item
              </Link>
            )
          )}

          {item.type === 'found' && (
            <div className="found-contact-section">
              {isFinder ? (
                <p>
                  You reported this item. Your contact details are private here.
                </p>
              ) : contactLoading ? (
                <p>Loading contact details...</p>
              ) : contactError ? (
                <p className="error-message">{contactError}</p>
              ) : contact ? (
                <>
                  <h3>Contact Finder</h3>

                  {contact.contactNumber && (
                    <div>
                      <a
                        className="primary-btn"
                        href={`tel:${contact.contactNumber.replace(/[^\d+]/g, '')}`}
                      >
                        📞 Call Finder
                      </a>
                    </div>
                  )}

                  {contact.whatsappNumber && (
                    <div>
                      <a
                        className="primary-btn"
                        href={`https://wa.me/${getWhatsAppNumber(contact.whatsappNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp Finder
                      </a>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ItemDetails;
