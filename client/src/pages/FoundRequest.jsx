
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';

function FoundRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [item, setItem] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch item from backend
  useEffect(() => {
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
          setError('Item not found or no longer active.');
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
  }, [id]);

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    setError('');

    if (!file) {
      setPhoto(null);
      setPreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      event.target.value = '';
      setPhoto(null);
      setPreview('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be 5 MB or less.');
      event.target.value = '';
      setPhoto(null);
      setPreview('');
      return;
    }

    setPhoto(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!photo) {
      setError('Please upload a photo of the item.');
      return;
    }

    if (!note.trim()) {
      setError('Please provide details about where you found the item.');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload image to Cloudinary through backend
      const formData = new FormData();
      formData.append('image', photo);

      const uploadResponse = await api.post(
        '/uploads/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const evidencePhotoUrl = uploadResponse.data.data.imageUrl;

      // Step 2: Save found request in MongoDB
      await api.post('/found-requests', {
        itemId: item._id,
        evidencePhotoUrl,
        note: note.trim()
      });

      alert('Found request submitted. Awaiting verification.');
      navigate(`/items/${item._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to submit found request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="report-section">
          <h2>Loading item...</h2>
        </div>
      </>
    );
  }

  if (error && !item) {
    return (
      <>
        <Navbar />
        <div className="report-section">
          <h2>{error}</h2>
          <Link to="/">Back to Home</Link>
        </div>
      </>
    );
  }

  if (item.type !== 'lost' || item.status !== 'active') {
    return (
      <>
        <Navbar />
        <div className="report-section">
          <h2>This item is not currently available for found requests.</h2>
          <Link to={`/items/${item._id}`}>Back to Item</Link>
        </div>
      </>
    );
  }

  const reporterId = String(
    item.reportedBy?._id || item.reportedBy
  );

  if (currentUser && reporterId === String(currentUser._id)) {
    return (
      <>
        <Navbar />
        <div className="report-section">
          <h2>You cannot submit a found request for your own item.</h2>
          <Link to={`/items/${item._id}`}>Back to Item</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="report-section">
        <Link className="back-btn" to={`/items/${item._id}`}>
          ← Back to Item
        </Link>

        <div className="report-card">
          <h2>Submit Found Item Evidence</h2>

          <p>
            Item: <strong>{item.title}</strong>
          </p>

          <p>
            Upload a photo of the actual item you found.
            Its status will not change until verification.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="evidencePhoto">Item Photo (Required)</label>

            <input
              id="evidencePhoto"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              required
            />

            <p className="form-hint">Image only, maximum 5 MB.</p>

            {preview && (
              <div className="photo-preview">
                <p>Photo Preview:</p>
                <img src={preview} alt="Found item preview" />
              </div>
            )}

            <label htmlFor="note">Additional Details (Required)</label>

            <textarea
              id="note"
              rows="3"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Where did you find this item?"
              required
            />

            {error && <p className="error-message">{error}</p>}

            <button
              className="primary-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Found Request'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default FoundRequest;
