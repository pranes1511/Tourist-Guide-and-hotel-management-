import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Search,
  Filter,
  ArrowLeft,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const ManagerReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReservations = async () => {
    try {
      const res = await api.manager.getBookings(statusFilter);
      if (res.success) {
        setReservations(res.data);
      }
    } catch (err) {
      console.warn('Error fetching manager bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await api.manager.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setReservations(
          reservations.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update reservation status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReservations = reservations.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const guestName = b.touristId?.name?.toLowerCase() || '';
    const refCode = b.bookingReference?.toLowerCase() || '';
    const hotelName = b.hotelId?.name?.toLowerCase() || '';
    return guestName.includes(term) || refCode.includes(term) || hotelName.includes(term);
  });

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/manager/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to Manager Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
          <div>
            <span className="section-tag">GUEST BOOKINGS</span>
            <h1 style={{ fontSize: '2.2rem', margin: '4px 0 0' }}>Hotel Guest Reservations</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage all guest reservations and check-in statuses across your properties.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card" style={{ marginBottom: '24px' }}>
        <div className="search-input-group" style={{ flex: 1 }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by guest name, booking reference, or hotel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-chips">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              className={`chip ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading guest reservations...</p>
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={40} color="var(--text-subtle)" />
          <h3>No reservations found</h3>
          <p>There are no guest bookings matching your search and filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive-wrap">
          <table className="manager-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Guest</th>
                <th>Hotel & Room</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((b) => (
                <tr key={b._id}>
                  <td>
                    <code>{b.bookingReference}</code>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <strong>{b.touristId?.name || 'Guest'}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {b.touristId?.phone || b.touristId?.email}
                    </div>
                  </td>
                  <td>
                    <strong>{b.hotelId?.name}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {b.roomId?.roomType} ({b.guests} Guests)
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem' }}>
                      {new Date(b.checkIn).toLocaleDateString()}
                    </div>
                    <small style={{ color: 'var(--text-muted)' }}>
                      to {new Date(b.checkOut).toLocaleDateString()} ({b.numberOfNights}N)
                    </small>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>
                      ₹{Math.round(b.totalAmount * 1.12).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>
                    <span className={`status-pill ${b.status}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={b.status}
                      disabled={updatingId === b._id}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="select-status-inline"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerReservations;
