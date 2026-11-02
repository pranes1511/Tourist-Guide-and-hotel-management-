import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bed,
  Plus,
  ArrowLeft,
  Users,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const ManagerRooms = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  // Form fields
  const [roomType, setRoomType] = useState('Deluxe Room');
  const [pricePerNight, setPricePerNight] = useState(3500);
  const [capacity, setCapacity] = useState(2);
  const [totalRooms, setTotalRooms] = useState(5);
  const [bedType, setBedType] = useState('King Bed');
  const [description, setDescription] = useState('');
  const [amenitiesString, setAmenitiesString] = useState('Air Conditioning, Private Bathroom, Flat-screen TV, Wi-Fi');
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomsAndHotel = async () => {
    try {
      const [hotelRes, roomsRes] = await Promise.all([
        api.hotels.getById(hotelId),
        api.rooms.getByHotel(hotelId),
      ]);

      if (hotelRes.success) setHotel(hotelRes.data);
      if (roomsRes.success) setRooms(roomsRes.data);
    } catch (err) {
      console.warn('Error loading rooms:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndHotel();
  }, [hotelId]);

  const openCreateModal = () => {
    setEditingRoom(null);
    setRoomType('Deluxe Room');
    setPricePerNight(3500);
    setCapacity(2);
    setTotalRooms(5);
    setBedType('King Bed');
    setDescription('');
    setAmenitiesString('Air Conditioning, Private Bathroom, Flat-screen TV, Wi-Fi');
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setRoomType(room.roomType);
    setPricePerNight(room.pricePerNight);
    setCapacity(room.capacity);
    setTotalRooms(room.totalRooms);
    setBedType(room.bedType || 'King Bed');
    setDescription(room.description || '');
    setAmenitiesString(room.amenities?.join(', ') || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      hotelId,
      roomType,
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      totalRooms: Number(totalRooms),
      bedType,
      description,
      amenities: amenitiesString.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      if (editingRoom) {
        await api.rooms.update(editingRoom._id, payload);
        alert('Room updated successfully!');
      } else {
        await api.rooms.create(payload);
        alert('Room type added successfully!');
      }
      setShowModal(false);
      fetchRoomsAndHotel();
    } catch (err) {
      alert(err.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;

    try {
      await api.rooms.delete(roomId);
      alert('Room type deleted successfully');
      fetchRoomsAndHotel();
    } catch (err) {
      alert(err.message || 'Failed to delete room');
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/manager/hotels" className="back-link">
          <ArrowLeft size={16} /> Back to My Hotels
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div>
            <span className="section-tag">ROOM INVENTORY MANAGEMENT</span>
            <h1 style={{ fontSize: '2.2rem', margin: '4px 0 0' }}>
              {hotel?.name || 'Hotel Rooms'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage room pricing, guest capacity, and total available rooms inventory.
            </p>
          </div>

          <button type="button" className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Room Type
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading room inventory...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <Bed size={40} color="var(--text-subtle)" />
          <h3>No rooms added for this hotel</h3>
          <p>Create your first room type (e.g. Deluxe Room or Executive Suite) to enable bookings.</p>
          <button type="button" className="btn-primary" style={{ marginTop: '16px' }} onClick={openCreateModal}>
            <Plus size={16} /> Add Room Type
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rooms.map((r) => (
            <div key={r._id} className="manager-room-item-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{r.roomType}</h3>
                  <span className="room-capacity-badge">
                    <Users size={13} /> {r.capacity} Guests Max
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '6px 0 0' }}>
                  {r.description || 'Standard luxury room furnishings and amenities.'}
                </p>

                <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '0.9rem' }}>
                  <span>Price: <strong style={{ color: 'var(--primary)' }}>₹{r.pricePerNight?.toLocaleString('en-IN')}</strong> / night</span>
                  <span>Bed: <strong>{r.bedType || 'King Bed'}</strong></span>
                  <span>Total Inventory: <strong>{r.totalRooms} rooms</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-icon-action"
                  onClick={() => openEditModal(r)}
                  title="Edit Room"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  className="btn-icon-action delete"
                  onClick={() => handleDelete(r._id)}
                  title="Delete Room"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRoom ? 'Edit Room Type' : 'Add New Room Type'}</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Room Type</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="form-input"
                >
                  <option value="Standard Room">Standard Room</option>
                  <option value="Deluxe Room">Deluxe Room</option>
                  <option value="Executive Suite">Executive Suite</option>
                  <option value="Family Suite">Family Suite</option>
                  <option value="Presidential Suite">Presidential Suite</option>
                </select>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Price Per Night (₹)</label>
                  <input
                    type="number"
                    min="500"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Max Guest Capacity</label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="form-input"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>{num} Guests</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '14px' }}>
                <div className="form-group">
                  <label>Total Rooms (Inventory Stock)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Bed Configuration</label>
                  <input
                    type="text"
                    placeholder="e.g. King Bed, 2 Queen Beds"
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Amenities (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Air Conditioning, Flat-screen TV, Mini Bar, Balcony"
                  value={amenitiesString}
                  onChange={(e) => setAmenitiesString(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Room Description</label>
                <textarea
                  rows={2}
                  placeholder="Features, balcony view, bathroom specs..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingRoom ? 'Save Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRooms;
