import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Check, ArrowRight, GitCompare } from 'lucide-react';

const HotelCard = ({ hotel, onToggleCompare, isComparing = false }) => {
  return (
    <div className="hotel-card">
      <div className="hotel-img-wrap">
        <img
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'}
          alt={hotel.name}
          className="hotel-img"
          loading="lazy"
        />
        <div className="hotel-stars-badge">
          {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
            <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
          ))}
          <span style={{ marginLeft: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {hotel.starRating}★
          </span>
        </div>
      </div>

      <div className="hotel-info">
        <div className="hotel-header">
          <span className="hotel-city">
            <MapPin size={14} /> {hotel.city}{hotel.state ? `, ${hotel.state}` : ''}
          </span>
          <span className="hotel-rating-pill">
            ★ {hotel.averageRating ? hotel.averageRating.toFixed(1) : '4.5'}
          </span>
        </div>

        <h3 className="hotel-title">{hotel.name}</h3>
        <p className="hotel-address">{hotel.address}</p>

        {/* Amenities chips */}
        <div className="hotel-amenities">
          {hotel.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} className="amenity-chip">
              <Check size={12} /> {a}
            </span>
          ))}
          {hotel.amenities?.length > 3 && (
            <span className="amenity-chip more">+{hotel.amenities.length - 3} more</span>
          )}
        </div>

        {/* Price & Action row */}
        <div className="hotel-action-row">
          <div className="hotel-pricing">
            <span className="price-label">Starting from</span>
            <span className="price-val">₹{hotel.priceStartingFrom?.toLocaleString('en-IN')}</span>
            <span className="price-period">/ night</span>
          </div>

          <div className="hotel-btn-group">
            {onToggleCompare && (
              <button
                type="button"
                className={`btn-compare-toggle ${isComparing ? 'active' : ''}`}
                onClick={() => onToggleCompare(hotel._id)}
                title="Select for comparison"
              >
                <GitCompare size={15} />
                {isComparing ? 'Comparing' : 'Compare'}
              </button>
            )}
            <Link to={`/hotels/${hotel._id}`} className="btn-view-hotel">
              View Rooms <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
