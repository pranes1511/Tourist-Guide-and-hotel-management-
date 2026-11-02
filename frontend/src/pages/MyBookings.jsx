import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Printer,
  CreditCard,
  XCircle,
  AlertCircle,
  Hotel,
  Compass
} from 'lucide-react';
import api from '../services/api';
import ReceiptModal from '../components/ReceiptModal';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.bookings.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Error fetching bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be initiated.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.bookings.cancel(bookingId, 'Cancelled by tourist');
      if (res.success) {
        alert('Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewReceipt = async (bookingId) => {
    try {
      const res = await api.payments.getReceipt(bookingId);
      if (res.success) {
        setSelectedReceipt(res.data);
      }
    } catch (err) {
      alert(err.message || 'Receipt could not be loaded');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="section-tag">TRAVEL RESERVATIONS</span>
          <h1 style={{ fontSize: '2.2rem', marginTop: '6px' }}>My Hotel Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track and manage your upcoming hotel stays, electronic invoices, and reservation history.
          </p>
        </div>

        <Link to="/hotels" className="btn-primary">
          <Hotel size={16} /> Book Another Hotel
        </Link>
      </div>

      {/* Tabs */}
      <div className="bookings-tabs">
        <button
          className={`b-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={`b-tab ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
        </button>
        <button
          className={`b-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Payment ({bookings.filter((b) => b.status === 'pending').length})
        </button>
        <button
          className={`b-tab ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your reservations...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <CalendarCheck size={40} color="var(--text-subtle)" />
          <h3>No bookings found in this category</h3>
          <p>You have not made any {activeTab !== 'all' ? activeTab : ''} reservations yet.</p>
          <Link to="/hotels" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Explore Hotels & Book
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'confirmed';
            const isPending = b.status === 'pending';
            const isCancelled = b.status === 'cancelled';

            return (
              <div key={b._id} className="booking-item-card">
                <div className="b-item-img-col">
                  <img
                    src={b.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80'}
                    alt={b.hotelId?.name}
                    className="b-item-img"
                  />
                  <span className={`status-pill ${b.status}`}>
                    {b.status.toUpperCase()}
                  </span>
                </div>

                <div className="b-item-info-col">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{b.hotelId?.name}</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <MapPin size={13} /> {b.hotelId?.address}, {b.hotelId?.city}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reference:</span>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '0.95rem' }}>
                        <code>{b.bookingReference}</code>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />

                  <div className="b-stay-details-grid">
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Room Type</small>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{b.roomId?.roomType}</p>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Stay Duration</small>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{b.numberOfNights} Nights ({b.guests} Guests)</p>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Check-in Date</small>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {new Date(b.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <small style={{ color: 'var(--text-muted)' }}>Total Amount</small>
                      <p style={{ margin: 0, fontWeight: '800', color: 'var(--primary)' }}>
                        ₹{Math.round(b.totalAmount * 1.12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="b-actions-row">
                    {isConfirmed && (
                      <>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.88rem' }}
                          onClick={() => handleViewReceipt(b._id)}
                        >
                          <Printer size={15} /> Electronic Receipt
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-booking"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancelBooking(b._id)}
                        >
                          <XCircle size={15} /> Cancel Booking
                        </button>
                      </>
                    )}

                    {isPending && (
                      <Link
                        to={`/payment/${b._id}`}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.88rem' }}
                      >
                        <CreditCard size={15} /> Complete Payment
                      </Link>
                    )}

                    {isCancelled && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 'bold' }}>
                        Cancelled ({b.cancellationReason || 'Refund Processed'})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;
