import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, Star, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DestinationCard = ({ destination }) => {
  const { user, toggleFavorite } = useAuth();
  const isFav = user?.favorites?.some(
    (f) => (typeof f === 'string' ? f : f?._id) === destination._id
  );

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to save destinations to your favorites!');
      return;
    }
    await toggleFavorite(destination._id);
  };

  return (
    <div className="destination-card">
      <div className="dest-image-wrap">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          loading="lazy"
          className="dest-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className="dest-category-pill">{destination.category}</span>
        {user?.role === 'tourist' && (
          <button
            className={`dest-fav-btn ${isFav ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#ffffff'} />
          </button>
        )}
      </div>

      <div className="dest-content">
        <div className="dest-meta-row">
          <span className="dest-location">
            <MapPin size={14} /> {destination.city}, {destination.state}
          </span>
          <span className="dest-rating">
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            {destination.averageRating ? destination.averageRating.toFixed(1) : 'New'}
          </span>
        </div>

        <h3 className="dest-name">{destination.name}</h3>
        <p className="dest-desc">
          {destination.description.length > 95
            ? `${destination.description.substring(0, 95)}...`
            : destination.description}
        </p>

        {destination.attractions?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
            {destination.attractions.slice(0, 2).map((a, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.75rem',
                  background: 'var(--bg-subtle, #f1f5f9)',
                  color: 'var(--text-main, #334155)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  border: '1px solid var(--border, #e2e8f0)',
                }}
              >
                📍 {a.name}
              </span>
            ))}
            {destination.attractions.length > 2 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  background: 'rgba(37, 99, 235, 0.08)',
                  color: 'var(--primary, #2563eb)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600',
                }}
              >
                +{destination.attractions.length - 2} more
              </span>
            )}
          </div>
        )}

        <div className="dest-footer">
          <span className="dest-season">
            <strong>Season:</strong> {destination.bestSeason || 'All Year'}
          </span>
          <Link to={`/destinations/${destination._id}`} className="btn-explore">
            Explore <Compass size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
