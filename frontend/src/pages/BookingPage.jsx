import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hotelId = searchParams.get('hotelId');
  const roomId = searchParams.get('roomId');

  // Dates & Guests
  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') || new Date().toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);

  // Guest Details
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Loaded Data
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availMessage, setAvailMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!hotelId || !roomId) {
        setErrorMessage('Missing hotel or room selection parameters.');
        setLoading(false);
        return;
      }

      try {
        const hotelRes = await api.hotels.getById(hotelId);
        if (hotelRes.success) {
          setHotel(hotelRes.data);
          const foundRoom = hotelRes.data.rooms?.find((r) => r._id === roomId);
          setRoom(foundRoom || null);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Error loading booking details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [hotelId, roomId]);

  // Live availability checking whenever dates change
  useEffect(() => {
    const verifyAvailability = async () => {
      if (!roomId || !checkIn || !checkOut) return;

      if (new Date(checkOut) <= new Date(checkIn)) {
        setIsAvailable(false);
        setAvailMessage('Check-out date must be after check-in date');
        return;
      }

      setCheckingAvail(true);
      try {
        const res = await api.rooms.checkAvailability({ roomId, checkIn, checkOut });
        if (res.success) {
          setIsAvailable(res.data.isAvailable);
          setAvailMessage(
            res.data.isAvailable
              ? `Room is available! (${res.data.availableRooms} left)`
              : 'Room is fully booked for these dates'
          );
        }
      } catch (err) {
        setIsAvailable(false);
        setAvailMessage(err.message);
      } finally {
        setCheckingAvail(false);
      }
    };

    verifyAvailability();
  }, [roomId, checkIn, checkOut]);

  // Pricing calculations
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights =
    checkIn && checkOut && checkOutDate > checkInDate
      ? Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))
      : 1;

  const roomRate = room?.pricePerNight || 3500;
  const roomTotal = roomRate * nights;
  const taxes = Math.round(roomTotal * 0.12);
  const grandTotal = roomTotal + taxes;

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAvailable) {
      alert('Cannot proceed: Selected dates are not available for this room.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.bookings.create({
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
      });

      if (res.success && res.data) {
        // Navigate to payment page for this booking
        navigate(`/payment/${res.data._id}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create booking reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Preparing reservation details...</p>
      </div>
    );
  }

  if (errorMessage && !hotel) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Booking Error</h2>
        <p style={{ color: 'var(--text-muted)' }}>{errorMessage}</p>
        <Link to="/hotels" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          Browse Hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to={`/hotels/${hotelId}`} className="back-link">
          <ArrowLeft size={16} /> Back to Hotel Details
        </Link>
        <h1 style={{ fontSize: '2.2rem', marginTop: '12px' }}>Review & Confirm Reservation</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Please review your stay dates, guest details, and pricing before continuing to simulated checkout.
        </p>
      </div>

      {errorMessage && (
        <div className="alert-banner error" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} /> {errorMessage}
        </div>
      )}

      <div className="booking-layout-grid">
        {/* Left Column: Form Details */}
        <div className="booking-form-col">
          <form onSubmit={handleSubmitBooking}>
            {/* Step 1: Stay Dates Card */}
            <div className="content-box" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Calendar size={20} color="var(--primary)" />
                <h3 style={{ margin: 0 }}>1. Stay Dates & Occupancy</h3>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Check-out Date</label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Number of Guests (Max Capacity: {room?.capacity || 2})</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="form-input"
                >
                  {Array.from({ length: room?.capacity || 4 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i > 0 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Availability Status */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: isAvailable ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: isAvailable ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {checkingAvail ? (
                  <span>Checking room availability...</span>
                ) : isAvailable ? (
                  <>
                    <CheckCircle size={16} /> {availMessage || 'Room is available for these dates!'}
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} /> {availMessage || 'Room not available for chosen dates'}
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Guest Details Card */}
            <div className="content-box" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Users size={20} color="var(--primary)" />
                <h3 style={{ margin: 0 }}>2. Primary Guest Information</h3>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Contact Phone</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Special Requests (Optional)</label>
                <textarea
                  placeholder="e.g. Quiet room, late check-in, ground floor request..."
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', justifyContent: 'center' }}
              disabled={submitting || !isAvailable || checkingAvail}
            >
              <CreditCard size={18} />
              {submitting ? 'Reserving...' : 'Continue to Payment Simulation'}
            </button>
          </form>
        </div>

        {/* Right Column: Reservation Summary Card */}
        <aside className="booking-summary-col">
          <div className="summary-card">
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', margin: 0 }}>
              Reservation Summary
            </h3>

            {/* Hotel Mini Card */}
            <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
              <img
                src={hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80'}
                alt={hotel?.name}
                style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{hotel?.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <MapPin size={13} /> {hotel?.city}, {hotel?.state}
                </p>
                <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>
                  ★ {hotel?.starRating} Star Hotel
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                {room?.roomType}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {nights} Night{nights > 1 ? 's' : ''} • {guests} Guest{guests > 1 ? 's' : ''}
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="pricing-breakdown">
              <div className="price-line">
                <span>Room charges ({nights} nights × ₹{roomRate.toLocaleString('en-IN')}):</span>
                <span>₹{roomTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-line">
                <span>GST & Hospitality Tax (12%):</span>
                <span>₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-line-total">
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--primary-dark)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', marginBottom: '4px' }}>
                <Sparkles size={14} /> Loyalty Reward Points
              </div>
              You will earn <strong>+{Math.round(grandTotal * 0.05)} reward points</strong> on this booking!
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BookingPage;
