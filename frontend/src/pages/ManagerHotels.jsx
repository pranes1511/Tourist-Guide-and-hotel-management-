import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Plus,
  Bed,
  MapPin,
  Star,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const ManagerHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('Panaji');
  const [state, setState] = useState('Goa');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [starRating, setStarRating] = useState(4);
  const [priceStartingFrom, setPriceStartingFrom] = useState(4500);
  const [imageUrl, setImageUrl] = useState('');
  const [amenitiesString, setAmenitiesString] = useState('Free Wi-Fi, Swimming Pool, Restaurant, Room Service');
  const [submitting, setSubmitting] = useState(false);

  const fetchHotels = async () => {
    try {
      const res = await api.manager.getHotels();
      if (res.success) {
        setHotels(res.data);
      }
    } catch (err) {
      console.warn('Error loading hotels:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openCreateModal = () => {
    setEditingHotel(null);
    setName('');
    setCity('Panaji');
    setState('Goa');
    setAddress('');
    setDescription('');
    setStarRating(4);
    setPriceStartingFrom(4500);
    setImageUrl('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80');
    setAmenitiesString('Free Wi-Fi, Swimming Pool, Restaurant, Room Service');
    setShowModal(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    setName(hotel.name);
    setCity(hotel.city);
    setState(hotel.state || '');
    setAddress(hotel.address);
    setDescription(hotel.description);
    setStarRating(hotel.starRating);
    setPriceStartingFrom(hotel.priceStartingFrom);
    setImageUrl(hotel.images?.[0] || '');
    setAmenitiesString(hotel.amenities?.join(', ') || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      city,
      state,
      address,
      description,
      starRating: Number(starRating),
      priceStartingFrom: Number(priceStartingFrom),
      images: imageUrl ? [imageUrl] : [],
      amenities: amenitiesString.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      if (editingHotel) {
        await api.hotels.update(editingHotel._id, payload);
        alert('Hotel updated successfully!');
      } else {
        await api.hotels.create(payload);
        alert('Hotel listing created successfully!');
      }
      setShowModal(false);
      fetchHotels();
    } catch (err) {
      alert(err.message || 'Failed to save hotel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel and all its room records?')) {
      return;
    }

    try {
      await api.hotels.delete(hotelId);
      alert('Hotel deleted successfully');
      fetchHotels();
    } catch (err) {
      alert(err.message || 'Error deleting hotel');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/manager/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Manager Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', margin: 0 }}>My Hotel Listings</h1>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Create, edit, and manage the hotel properties you own and operate.
            </p>
          </div>

          <button type="button" className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Add New Hotel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your hotel portfolio...</p>
        </div>
      ) : hotels.length === 0 ? (
        <div className="empty-state">
          <Building size={40} color="var(--text-subtle)" />
          <h3>No hotels listed yet</h3>
          <p>Add your first hotel property to start managing room inventory and reservations.</p>
          <button type="button" className="btn-primary" style={{ marginTop: '16px' }} onClick={openCreateModal}>
            <Plus size={16} /> Add Hotel Now
          </button>
        </div>
      ) : (
        <div className="manager-hotels-grid">
          {hotels.map((h) => (
            <div key={h._id} className="manager-hotel-card">
              <div style={{ position: 'relative' }}>
                <img
                  src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=80'}
                  alt={h.name}
                  className="m-hotel-img"
                />
                <span className="hotel-stars-badge" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  ★ {h.starRating} Stars
                </span>
              </div>

              <div className="m-hotel-body">
                <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem' }}>{h.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  <MapPin size={13} /> {h.address}, {h.city}
                </p>

                <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', margin: '10px 0', lineHeight: '1.5' }}>
                  {h.description?.length > 110 ? `${h.description.substring(0, 110)}...` : h.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <span>Base Rate: <strong>₹{h.priceStartingFrom?.toLocaleString('en-IN')}</strong></span>
                  <span>Rooms: <strong>{h.roomCount || 0} types</strong></span>
                </div>

                <div className="m-hotel-actions">
                  <Link to={`/manager/rooms/${h._id}`} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                    <Bed size={15} /> Rooms ({h.roomCount || 0})
                  </Link>

                  <button
                    type="button"
                    className="btn-icon-action"
                    onClick={() => openEditModal(h)}
                    title="Edit Hotel Details"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    type="button"
                    className="btn-icon-action delete"
                    onClick={() => handleDelete(h._id)}
                    title="Delete Hotel"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Hotel Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingHotel ? 'Edit Hotel Details' : 'Add New Hotel Listing'}</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Hotel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Heritage Resort & Spa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Physical Address</label>
                <input
                  type="text"
                  placeholder="Street, Landmark, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Star Classification (1 to 5)</label>
                  <select
                    value={starRating}
                    onChange={(e) => setStarRating(e.target.value)}
                    className="form-input"
                  >
                    {[5, 4, 3, 2, 1].map((s) => (
                      <option key={s} value={s}>{s} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Starting Price (₹/Night)</label>
                  <input
                    type="number"
                    min="500"
                    value={priceStartingFrom}
                    onChange={(e) => setPriceStartingFrom(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Cover Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Amenities (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Free Wi-Fi, Swimming Pool, Spa, Restaurant"
                  value={amenitiesString}
                  onChange={(e) => setAmenitiesString(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Detailed Hotel Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your property's architecture, location advantages, dining..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="form-input"
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingHotel ? 'Save Changes' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerHotels;
