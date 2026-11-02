import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Compass, AlertCircle, MapPin, X, Sparkles } from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL or state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');

  const states = [
    'All',
    'Tamil Nadu',
    'Goa',
    'Rajasthan',
    'Himachal Pradesh',
    'Kerala',
    'Uttar Pradesh',
  ];

  const categories = [
    'All',
    'Hill Stations',
    'Temples',
    'Heritage',
    'Beaches',
    'Waterfalls',
    'Nature and Wildlife',
    'Adventure',
    'Cultural Tourism',
    'Mountains',
    'Hills',
    'Wildlife',
  ];

  const fetchDestinations = async (overrides = {}) => {
    setLoading(true);
    setError(null);
    try {
      const activeSearch = overrides.search !== undefined ? overrides.search : searchTerm;
      const activeCategory = overrides.category !== undefined ? overrides.category : category;
      const activeState = overrides.state !== undefined ? overrides.state : selectedState;
      const activeSort = overrides.sort !== undefined ? overrides.sort : sortBy;

      const params = {};
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();
      if (activeCategory && activeCategory !== 'All') params.category = activeCategory;
      if (activeState && activeState !== 'All') params.state = activeState;
      if (activeSort) params.sort = activeSort;

      const res = await api.destinations.getAll(params);

      // Backend response format: { success: true, count: 26, data: [...] }
      let destinationsList = [];
      if (res && res.success && Array.isArray(res.data)) {
        destinationsList = res.data;
      } else if (Array.isArray(res?.data)) {
        destinationsList = res.data;
      } else if (Array.isArray(res)) {
        destinationsList = res;
      } else if (res && !res.success) {
        throw new Error(res.message || 'Server returned an unsuccessful response');
      } else {
        throw new Error('Received unexpected destination data structure from server');
      }

      setDestinations(destinationsList);
      setError(null);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err.message || 'Unable to connect to the backend server. Please verify backend is running on http://localhost:5000.');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();

    // Sync state and category with URL search params
    const newParams = new URLSearchParams();
    if (searchTerm.trim()) newParams.set('search', searchTerm.trim());
    if (category !== 'All') newParams.set('category', category);
    if (selectedState !== 'All') newParams.set('state', selectedState);
    if (sortBy !== 'popular') newParams.set('sort', sortBy);
    setSearchParams(newParams, { replace: true });
  }, [category, selectedState, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams, { replace: true });
    fetchDestinations({ search: searchTerm.trim() });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams, { replace: true });
    fetchDestinations({ search: '' });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setSelectedState('All');
    setSortBy('popular');
    setSearchParams({}, { replace: true });
    fetchDestinations({ search: '', category: 'All', state: 'All', sort: 'popular' });
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="section-tag">EXPLORE INCREDIBLE INDIA</span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '8px' }}>Tourist Destinations & Attractions</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', margin: '8px auto 0', lineHeight: 1.6 }}>
          Discover majestic hill stations, ancient living temples, pristine tropical beaches, roaring waterfalls,
          and heritage landmarks with comprehensive travel guidance.
        </p>
      </div>

      {/* Tamil Nadu Spotlight Highlight Banner if Tamil Nadu is selected */}
      {selectedState === 'Tamil Nadu' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </span>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                Tamil Nadu Tourism Explorer
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Explore 20 premier destinations featuring Great Living Chola temples, misty Nilgiri hill resorts,
                sacred shoreline monuments, and therapeutic mountain waterfalls.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedState('All')}
            className="chip active"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            Show All States <X size={14} style={{ marginLeft: '4px' }} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar Card */}
      <div className="destinations-filter-card">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="dest-search-bar">
          <Search size={20} color="var(--primary)" />
          <input
            type="text"
            placeholder="Search by destination (Ooty, Madurai) or attraction name (Meenakshi Temple, Shore Temple, Pichavaram)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dest-search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="btn-primary" style={{ padding: '10px 22px', flexShrink: 0 }}>
            Search
          </button>
        </form>

        {/* State Filter Chips */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <MapPin size={15} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Filter by State:
            </span>
          </div>
          <div className="filter-chips-row">
            {states.map((st) => (
              <button
                key={st}
                type="button"
                className={`filter-chip ${selectedState === st ? 'active' : ''}`}
                onClick={() => setSelectedState(st)}
              >
                {st === 'All' ? 'All States' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Chips & Sort Controls */}
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                Filter by Category:
              </span>
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select-input"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="filter-chips-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Row & Results Count */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '24px 0 16px',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Showing <strong>{destinations.length}</strong> {destinations.length === 1 ? 'destination' : 'destinations'}
          {selectedState !== 'All' ? ` in ${selectedState}` : ''}
          {category !== 'All' ? ` (${category})` : ''}
          {searchTerm ? ` matching "${searchTerm}"` : ''}
        </p>

        {(selectedState !== 'All' || category !== 'All' || searchTerm.trim()) && (
          <button
            onClick={handleResetFilters}
            className="btn-outline-sm"
            style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Clear All Filters
          </button>
        )}
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="loading-state" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
          <p>Finding destinations & attractions...</p>
        </div>
      ) : error ? (
        <div
          className="empty-state"
          style={{
            borderColor: 'rgba(239, 68, 68, 0.35)',
            background: 'rgba(239, 68, 68, 0.04)',
            padding: '40px 24px',
          }}
        >
          <AlertCircle size={44} color="#ef4444" />
          <h3 style={{ marginTop: '12px', color: '#dc2626' }}>Failed to Load Destinations</h3>
          <p style={{ maxWidth: '520px', margin: '8px auto', color: 'var(--text-muted)' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <button className="btn-primary" onClick={() => fetchDestinations()}>
              Retry Connection
            </button>
            <button className="btn-outline" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={44} color="var(--text-subtle)" />
          <h3 style={{ marginTop: '12px' }}>No destinations match your criteria</h3>
          <p style={{ maxWidth: '480px', margin: '8px auto' }}>
            We couldn't find any destinations matching your current search or filter combination.
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: '16px' }}
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {destinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Destinations;
