
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import api from '../services/api';
import './ReportItem.css';

function ReportItem() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type') === 'found' ? 'found' : 'lost';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    date: '',
    contactNumber: '',
    whatsappNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      type === 'found' &&
      !formData.contactNumber.trim() &&
      !formData.whatsappNumber.trim()
    ) {
      setError('Please provide at least one contact number.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/items', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        dateLostFound: formData.date,
        type,
        contactNumber: type === 'found' ? formData.contactNumber.trim() : '',
        whatsappNumber: type === 'found' ? formData.whatsappNumber.trim() : ''
      });

      const createdItem = response.data.data.item || response.data.data;

      navigate(`/items/${createdItem._id}`);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Unable to submit report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <div className="report-section">
        <Link className="back-btn" to="/">← Back to Home</Link>

        <div className="report-card">
          <h2>Report {type === 'lost' ? 'Lost' : 'Found'} Item</h2>
          <p>Enter the details of your item below.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Item Name</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Black Backpack"
              required
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item..."
              required
            />

            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Bags">Bags</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Keys">Keys</option>
              <option value="Accessories">Accessories</option>
              <option value="Documents">Documents</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. University Library"
              required
            />

            <label htmlFor="date">
              {type === 'found' ? 'Date Found' : 'Date Lost'}
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            {type === 'found' && (
              <>
                <h3>Contact Information</h3>
                <p>Provide at least one contact number.</p>

                <label htmlFor="contactNumber">
                  Contact Number (Optional)
                </label>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 03001234567"
                />

                <label htmlFor="whatsappNumber">
                  WhatsApp Number (Optional)
                </label>
                <input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g. 03001234567"
                />
              </>
            )}

            {error && <p className="error-message">{error}</p>}

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default ReportItem;
