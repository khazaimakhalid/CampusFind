
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import api from '../services/api';
import './Home.css';

function Home() {
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedType = searchParams.get('type') || 'all';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/items');

        const data = response.data.data;
        const fetchedItems = Array.isArray(data)
          ? data
          : data.items || [];

        setItems(fetchedItems);

      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Unable to load items. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  function changeFilter(type) {
    if (type === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type });
    }
  }

  const filteredItems = items.filter((item) => {
    const text = `${item.title} ${item.category} ${item.location}`.toLowerCase();

    const matchesSearch = text.includes(searchText.toLowerCase());
    const matchesType =
      selectedType === 'all' || item.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <>
      <Navbar />

      <main id="home">
        <section className="hero">
          <p className="tagline">YOUR CAMPUS, CONNECTED</p>

          <h1>
            Lost something?
            <br />
            <span>Let's find it.</span>
          </h1>

          <p className="hero-text">
            A lost and found community for your campus.
            Report lost belongings or help someone find theirs.
          </p>

          <div className="hero-buttons">
            <Link className="primary-btn" to="/report?type=lost">
              Report Lost Item
            </Link>

            <Link className="secondary-btn" to="/report?type=found">
              Report Found Item
            </Link>
          </div>
        </section>

        <section className="search-section">
          <h2>Find your missing item</h2>

          <input
            type="text"
            placeholder="Search wallets, keys, books..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          <div className="filter-buttons">
            <button
              className={selectedType === 'all' ? 'active-filter' : ''}
              onClick={() => changeFilter('all')}
            >
              All Items
            </button>

            <button
              className={selectedType === 'lost' ? 'active-filter' : ''}
              onClick={() => changeFilter('lost')}
            >
              Lost Items
            </button>

            <button
              className={selectedType === 'found' ? 'active-filter' : ''}
              onClick={() => changeFilter('found')}
            >
              Found Items
            </button>
          </div>
        </section>

        <section className="items-section">
          <h2>Recently Reported Items</h2>
          <p>Explore items reported by your campus community.</p>

          <div className="item-grid">
            {loading ? (
              <p>Loading items...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              filteredItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))
            )}
          </div>

          {!loading && !error && filteredItems.length === 0 && (
            <p>No matching items found.</p>
          )}
        </section>
      </main>

      <footer>
        <p>© 2026 CampusFind | Bringing lost belongings home.</p>
      </footer>
    </>
  );
}

export default Home;
