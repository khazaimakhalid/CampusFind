
import { Link } from 'react-router-dom';
import './ItemCard.css';

function ItemCard({ item }) {

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

  return (
    <div className="item-card">

      <div className="item-icon">
        {getItemIcon(item.category)}
      </div>

      <span className={item.type === 'lost' ? 'lost-label' : 'found-label'}>
        {item.type.toUpperCase()}
      </span>

      <h3>{item.title}</h3>

      <p>Category: {item.category}</p>

      <p>Location: {item.location}</p>

      <p>
        Date: {new Date(item.dateLostFound).toLocaleDateString()}
      </p>

      <Link
        className="details-btn"
        to={`/items/${item._id}`}
      >
        View Details
      </Link>

    </div>
  );
}

export default ItemCard;
