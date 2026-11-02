import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Printer,
  Sparkles,
  ArrowRight,
  Compass,
  FileText
} from 'lucide-react';
import api from '../services/api';
import ReceiptModal from '../components/ReceiptModal';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await api.bookings.getById(bookingId);
        if (res.success) {
          setBooking(res.data);
        }
      } catch (err) {
        console.warn('Error loading confirmation:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Finalizing reservation confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Reservation Not Found</h2>
        <Link to="/my-bookings" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const pointsEarned = Math.round(booking.totalAmount * 0.05);

  return (
    <div className="container" style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      {/* Animated Checkmark Badge */}
      <div className="confirm-icon-wrap">
        <CheckCircle2 size={54} color="#ffffff" />
      </div>

      <span className="badge-tag" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: 'none' }}>
        PAYMENT CONFIRMED
      </span>

      <h1 style={{ fontSize: '2.5rem', margin: '12px 0 6px' }}>Your Stay is Booked!</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto' }}>
        We have confirmed your room reservation. An electronic receipt has been generated for your records.
      </p>

      {/* Confirmation Card */}
      <div className="confirmation-card">
        <div className="confirm-header-row">
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking Reference</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {booking.bookingReference}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--success)' }}>
              ● Confirmed
            </div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

        {/* Hotel & Stay Details */}
        <div style={{ textAlign: 'left', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img
            src={booking.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80'}
            alt={booking.hotelId?.name}
            style={{ width: '85px', height: '85px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>{booking.hotelId?.name}</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <MapPin size={13} /> {booking.hotelId?.address}, {booking.hotelId?.city}
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '0.9rem', fontWeight: '600' }}>
              {booking.roomId?.roomType} • {booking.numberOfNights} Nights • {booking.guests} Guests
            </p>
          </div>
        </div>

        {/* Dates Bar */}
        <div className="confirm-dates-bar">
          <div>
            <small style={{ color: 'var(--text-muted)' }}>Check-in</small>
            <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
              {new Date(booking.checkIn).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)' }}></div>
          <div>
            <small style={{ color: 'var(--text-muted)' }}>Check-out</small>
            <p style={{ margin: '2px 0 0', fontWeight: 'bold' }}>
              {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div style={{ borderLeft: '1px solid var(--border)' }}></div>
          <div>
            <small style={{ color: 'var(--text-muted)' }}>Total Paid</small>
            <p style={{ margin: '2px 0 0', fontWeight: 'bold', color: 'var(--primary)' }}>
              ₹{booking.receipt?.billing?.totalPaid ? booking.receipt.billing.totalPaid.toLocaleString('en-IN') : Math.round(booking.totalAmount * 1.12).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Reward points callout */}
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary-dark)', fontSize: '0.9rem' }}>
          <Sparkles size={16} />
          <span>You earned <strong>+{pointsEarned} reward points</strong> on this trip!</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowReceiptModal(true)}
        >
          <Printer size={16} /> View & Print Receipt
        </button>

        <Link to="/my-bookings" className="btn-secondary">
          <FileText size={16} /> Go to My Bookings
        </Link>

        <Link to="/destinations" className="btn-secondary">
          <Compass size={16} /> Explore Destinations
        </Link>
      </div>

      {/* Electronic Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          receipt={booking.receipt}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};

export default BookingConfirmation;
