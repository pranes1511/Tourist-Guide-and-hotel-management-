import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  MapPin,
  GitCompare,
  SlidersHorizontal,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import HotelCard from '../components/HotelCard';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 20000);
  const [selectedStar, setSelectedStar] = useState(searchParams.get('starRating') || 'All');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');

  // Compare selection state (stores hotel IDs)
  const [compareList, setCompareList] = useState([]);

  const cities = ['All', 'Panaji', 'Jaipur', 'Manali', 'Munnar', 'Agra', 'Varanasi'];
  const amenitiesList = [
    'Free Wi-Fi',
    'Swimming Pool',
    'Spa & Wellness',
    'Fine Dining',
    'Free Parking',
    'Gym',
    'Mountain View',
    'Beach Access',
  ];

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city && city !== 'All') params.city = city;
      if (maxPrice) params.maxPrice = maxPrice;
      if (selectedStar && selectedStar !== 'All') params.starRating = selectedStar;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');
      if (sortBy) params.sort = sortBy;

      const res = await api.hotels.getAll(params);
      if (res.success) {
        setHotels(res.data);
      }
    } catch (error) {
      console.warn('Error loading hotels:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [city, maxPrice, selectedStar, selectedAmenities, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const toggleAmenity = (amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleToggleCompare = (hotelId) => {
    if (compareList.includes(hotelId)) {
      setCompareList(compareList.filter((id) => id !== hotelId));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare a maximum of 3 hotels simultaneously.');
        return;
      }
      setCompareList([...compareList, hotelId]);
    }
  };

  const handleLaunchCompare = () => {
    if (compareList.length < 2) {
      alert('Please select at least 2 hotels to launch comparison.');
      return;
    }
    navigate(`/hotels/compare?ids=${compareList.join(',')}`);
  };

  const resetAllFilters = () => {
    setSearch('');
    setCity('All');
    setMaxPrice(20000);
    setSelectedStar('All');
    setSelectedAmenities([]);
    setSortBy('rating');
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="section-tag">PREMIER HOSPITALITY</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '8px' }}>Hotel Search & Room Booking</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '8px auto 0' }}>
          Find, filter and compare the best verified hotels, heritage palaces, and luxury resorts across India.
        </p>
      </div>

      {/* Main Search & Layout */}
      <div className="hotels-layout">
        {/* Filter Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Filter Hotels</h3>
              </div>
              <button type="button" className="btn-reset-filters" onClick={resetAllFilters}>
                Reset
              </button>
            </div>

            {/* City Selector */}
            <div className="filter-group">
              <label className="filter-label">City / Destination</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="form-input">
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price Range Slider */}
            <div className="filter-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label className="filter-label">Max Price / Night</label>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  ₹{Number(maxPrice).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="25000"
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>₹2,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Star Rating Filter */}
            <div className="filter-group">
              <label className="filter-label">Star Rating</label>
              <div className="star-filter-options">
                {['All', '5', '4', '3'].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-chip ${selectedStar === star ? 'active' : ''}`}
                    onClick={() => setSelectedStar(star)}
                  >
                    {star === 'All' ? 'All Stars' : `${star}★ & Above`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="filter-group">
              <label className="filter-label">Amenities</label>
              <div className="amenity-checkbox-list">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Hotels Results Column */}
        <main className="hotels-results-col">
          {/* Top Search & Sort Row */}
          <div className="hotels-top-bar">
            <form onSubmit={handleSearchSubmit} className="search-input-group" style={{ flex: 1 }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search hotel name or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn-search-submit">Search</button>
            </form>

            <div className="sort-box">
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="select-sort">
                <option value="rating">Highest Rating</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '16px 0' }}>
            Found <strong>{hotels.length}</strong> hotels matching your preferences
          </p>

          {/* Hotels Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Searching available hotels...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="empty-state">
              <AlertCircle size={40} color="var(--text-subtle)" />
              <h3>No hotels found</h3>
              <p>Try widening your price range or adjusting selected amenities.</p>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={resetAllFilters}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="hotels-vertical-list">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                  isComparing={compareList.includes(hotel._id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Compare Tray (Displays when hotels are selected) */}
      {compareList.length > 0 && (
        <div className="floating-compare-bar">
          <div className="compare-bar-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitCompare size={20} color="var(--primary)" />
              <span>
                <strong>{compareList.length}</strong> hotel{compareList.length > 1 ? 's' : ''} selected for comparison
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={() => setCompareList([])}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleLaunchCompare}
                disabled={compareList.length < 2}
              >
                Compare Now ({compareList.length}/3)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
