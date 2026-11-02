import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  Star,
  MapPin,
  Check,
  X,
  Hotel,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const HotelComparison = () => {
  const [searchParams] = useSearchParams();
  const [comparedHotels, setComparedHotels] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const idsParam = searchParams.get('ids');

  useEffect(() => {
    const loadComparison = async () => {
      setLoading(true);
      try {
        const allRes = await api.hotels.getAll();
        if (allRes.success) setAllHotels(allRes.data);

        if (idsParam) {
          const ids = idsParam.split(',').map((id) => id.trim());
          const compRes = await api.hotels.compare(ids);
          if (compRes.success) {
            setComparedHotels(compRes.data);
          }
        } else if (allRes.data && allRes.data.length >= 2) {
          // Default: compare first two hotels
          const defaultIds = [allRes.data[0]._id, allRes.data[1]._id];
          const compRes = await api.hotels.compare(defaultIds);
          if (compRes.success) {
            setComparedHotels(compRes.data);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to compare hotels');
      } finally {
        setLoading(false);
      }
    };

    loadComparison();
  }, [idsParam]);

  const allPossibleAmenities = [
    'Free Wi-Fi',
    'Swimming Pool',
    'Spa & Wellness',
    'Fine Dining',
    'Free Parking',
    'Gym',
    'Room Service',
    'Air Conditioning',
    'Mountain View',
    'Beach Access',
    'Ganges View',
  ];

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading comparative hotel matrix...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/hotels" className="back-link">
          <ArrowLeft size={16} /> Back to Hotel Search
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <GitCompare size={26} color="var(--primary)" />
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Hotel Comparison Tool</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
          Compare pricing, star ratings, amenities, and available room types side-by-side to make the best reservation.
        </p>
      </div>

      {comparedHotels.length < 2 ? (
        <div className="empty-state">
          <AlertCircle size={40} color="var(--text-subtle)" />
          <h3>Select at least 2 hotels to compare</h3>
          <p>Please browse our hotel listings and click "Compare" on 2 or 3 hotels.</p>
          <Link to="/hotels" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Go to Hotel Listings
          </Link>
        </div>
      ) : (
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-col">Features</th>
                {comparedHotels.map((h) => (
                  <th key={h._id} className="hotel-header-col">
                    <img
                      src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80'}
                      alt={h.name}
                      className="comp-header-img"
                    />
                    <h3 className="comp-hotel-name">{h.name}</h3>
                    <p className="comp-hotel-city">
                      <MapPin size={13} /> {h.city}, {h.state}
                    </p>
                    <Link to={`/hotels/${h._id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                      Reserve Stays <ArrowRight size={14} />
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: Starting Price */}
              <tr className="highlight-row">
                <td className="row-label">Base Rate / Night</td>
                {comparedHotels.map((h) => (
                  <td key={h._id} className="comp-cell price-cell">
                    <span className="price-big">₹{h.priceStartingFrom?.toLocaleString('en-IN')}</span>
                    <small style={{ display: 'block', color: 'var(--text-muted)' }}>excluding taxes</small>
                  </td>
                ))}
              </tr>

              {/* Row: Star Rating */}
              <tr>
                <td className="row-label">Star Classification</td>
                {comparedHotels.map((h) => (
                  <td key={h._id} className="comp-cell">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      {Array.from({ length: h.starRating || 3 }).map((_, i) => (
                        <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                      ))}
                      <span style={{ fontWeight: 'bold', marginLeft: '4px' }}>{h.starRating} Stars</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: User Review Score */}
              <tr>
                <td className="row-label">Guest Rating Score</td>
                {comparedHotels.map((h) => (
                  <td key={h._id} className="comp-cell">
                    <span className="rating-pill-large">
                      ★ {h.averageRating ? h.averageRating.toFixed(1) : '4.8'} / 5.0
                    </span>
                    <small style={{ display: 'block', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Based on {h.totalReviews || 12} reviews
                    </small>
                  </td>
                ))}
              </tr>

              {/* Row: Available Room Types */}
              <tr>
                <td className="row-label">Room Types Offered</td>
                {comparedHotels.map((h) => (
                  <td key={h._id} className="comp-cell">
                    <ul className="comp-room-types-list">
                      {h.rooms?.map((r) => (
                        <li key={r._id}>
                          <strong>{r.roomType}</strong> (up to {r.capacity} guests)
                          <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            ₹{r.pricePerNight?.toLocaleString('en-IN')} / night
                          </div>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* Row: Contact Phone */}
              <tr>
                <td className="row-label">Front Desk Contact</td>
                {comparedHotels.map((h) => (
                  <td key={h._id} className="comp-cell">
                    {h.contactPhone || '+91 98765 43210'}
                  </td>
                ))}
              </tr>

              {/* Section Header: Amenities */}
              <tr className="section-divider-row">
                <td colSpan={comparedHotels.length + 1}>AMENITIES MATRIX</td>
              </tr>

              {allPossibleAmenities.map((amenity) => {
                // Only show if at least one hotel has it
                const atLeastOneHas = comparedHotels.some((h) => h.amenities?.includes(amenity));
                if (!atLeastOneHas) return null;

                return (
                  <tr key={amenity}>
                    <td className="row-label">{amenity}</td>
                    {comparedHotels.map((h) => {
                      const hasIt = h.amenities?.includes(amenity);
                      return (
                        <td key={h._id} className="comp-cell">
                          {hasIt ? (
                            <span className="icon-check-circle">
                              <Check size={18} />
                            </span>
                          ) : (
                            <span className="icon-cross-circle">
                              <X size={18} />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelComparison;
