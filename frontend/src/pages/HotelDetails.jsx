import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Check,
  Calendar,
  Users,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  Bed,
  CreditCard,
  MessageSquare,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date selection state (Defaults: tomorrow for 2 nights)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(threeDaysLater.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(2);

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchHotel = async () => {
    try {
      const res = await api.hotels.getById(id);
      if (res.success) {
        setHotel(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const handleBookRoom = (roomId) => {
    if (!isAuthenticated) {
      alert('Please log in as a tourist to make a room reservation.');
      navigate('/login');
      return;
    }
    navigate(`/book?hotelId=${hotel._id}&roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.reviews.create({
        targetType: 'Hotel',
        hotelId: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success) {
        setReviewSuccess(true);
        setReviewTitle('');
        setReviewComment('');
        fetchHotel(); // Refresh
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (err) {
      alert(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading hotel rooms & rates...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Hotel Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Unable to locate hotel records.'}</p>
        <Link to="/hotels" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Hotel Search
        </Link>
      </div>
    );
  }

  // Calculate nights for preview
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = checkOutDate - checkInDate;
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1240px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/hotels" className="back-link">
          <ArrowLeft size={16} /> Back to Hotel Search
        </Link>
      </div>

      {/* Hotel Title Header */}
      <div className="hotel-header-section">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {Array.from({ length: hotel.starRating || 3 }).map((_, i) => (
                <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '0.9rem' }}>
              {hotel.starRating} Star Luxury Hotel
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', margin: '6px 0' }}>{hotel.name}</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--primary)" /> {hotel.address}, {hotel.city}, {hotel.state}
          </p>
        </div>

        <div className="hotel-rating-badge-card">
          <span className="rating-num">★ {hotel.averageRating ? hotel.averageRating.toFixed(1) : '4.8'}</span>
          <span className="rating-label">Based on {hotel.totalReviews || 18} verified guest reviews</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="hotel-gallery-grid">
        <img
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80'}
          alt={hotel.name}
          className="gallery-main-img"
        />
        <div className="gallery-sub-col">
          <img
            src={hotel.images?.[1] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&auto=format&fit=crop&q=80'}
            alt=""
            className="gallery-sub-img"
          />
          <img
            src={hotel.images?.[2] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'}
            alt=""
            className="gallery-sub-img"
          />
        </div>
      </div>

      {/* Stay Dates Picker Card */}
      <div className="dates-picker-card">
        <div className="dates-head">
          <Calendar size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Select Stay Dates & Guests</h3>
          <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--primary)' }}>
            {nights} Night{nights > 1 ? 's' : ''} Selected
          </span>
        </div>

        <div className="dates-inputs-row">
          <div className="date-input-group">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="date-input-group">
            <label>Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="date-input-group">
            <label>Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="form-input"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Guest{num > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Available Room Types Section */}
      <section style={{ marginTop: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span className="section-tag">RESERVATION INVENTORY</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>Available Rooms & Rates</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Prices are calculated for {nights} night{nights > 1 ? 's' : ''} stay. Room availability is strictly verified before confirmation.
          </p>
        </div>

        {hotel.rooms?.length === 0 ? (
          <div className="empty-state">
            <p>No room types currently available for this hotel.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {hotel.rooms?.map((room) => {
              const totalRoomPrice = room.pricePerNight * nights;

              return (
                <div key={room._id} className="room-card">
                  <img
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'}
                    alt={room.roomType}
                    className="room-card-img"
                  />
                  <div className="room-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{room.roomType}</h3>
                      <span className="room-capacity-badge">
                        <Users size={14} /> Up to {room.capacity} Guests
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '8px 0' }}>
                      {room.description || 'Includes private ensuite bathroom, air conditioning, and premium linen.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <Bed size={15} /> <span>{room.bedType || 'King Bed'}</span>
                    </div>

                    {/* Room Amenities */}
                    <div className="room-amenities-chips">
                      {room.amenities?.map((a, i) => (
                        <span key={i} className="amenity-chip-sm">
                          <Check size={12} color="var(--success)" /> {a}
                        </span>
                      ))}
                    </div>

                    {/* Pricing and Action */}
                    <div className="room-footer-row">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ₹{room.pricePerNight?.toLocaleString('en-IN')} / night
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                          ₹{totalRoomPrice.toLocaleString('en-IN')}{' '}
                          <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({nights} nights)</small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleBookRoom(room._id)}
                      >
                        Reserve Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Amenities & Contact Section */}
      <div className="hotel-info-grid" style={{ marginTop: '40px' }}>
        <div className="content-box">
          <h3>Property Amenities</h3>
          <div className="amenities-checklist">
            {hotel.amenities?.map((amenity, idx) => (
              <div key={idx} className="amenity-check-item">
                <Check size={16} color="var(--success)" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-box">
          <h3>Front Desk & Contact</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '16px' }}>
            Contact the property manager for special check-in requests, airport transfers, or dining inquiries.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="var(--primary)" />
              <span>{hotel.contactPhone || '+91 832 668 3333'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--primary)" />
              <span>{hotel.contactEmail || 'reservations@hotel.com'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="content-box" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <MessageSquare size={22} color="var(--primary)" />
          <h2 style={{ margin: 0 }}>Guest Reviews & Ratings</h2>
        </div>

        {/* Tourist Review Submission Form */}
        {isAuthenticated && user?.role === 'tourist' ? (
          <form className="review-form-card" onSubmit={handleReviewSubmit}>
            <h4>Rate your stay at {hotel.name}</h4>
            {reviewSuccess && (
              <div className="alert-success" style={{ margin: '12px 0' }}>
                Thank you! Your hotel review has been recorded.
              </div>
            )}

            <div style={{ margin: '12px 0' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Star Rating:
              </label>
              <StarRating
                rating={reviewRating}
                interactive={true}
                size={24}
                onRatingChange={(newVal) => setReviewRating(newVal)}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Review Headline (e.g. Exceptional Hospitality & Pool)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <textarea
                placeholder="Share your experience regarding room cleanliness, food quality, staff friendliness..."
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                className="form-input"
              ></textarea>
            </div>

            <button type="submit" className="btn-primary" disabled={submittingReview}>
              <Send size={15} /> {submittingReview ? 'Submitting...' : 'Submit Hotel Review'}
            </button>
          </form>
        ) : !isAuthenticated ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            <Link to="/login" style={{ fontWeight: 'bold' }}>Log in</Link> to post a review for this hotel.
          </p>
        ) : null}

        {/* Reviews List */}
        <div className="reviews-feed">
          {hotel.reviews?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No guest reviews yet. Be the first to review!</p>
          ) : (
            hotel.reviews?.map((r) => (
              <div key={r._id} className="review-bubble">
                <div className="review-bubble-head">
                  <div>
                    <strong>{r.touristId?.name || 'Verified Guest'}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={r.rating} size={14} />
                </div>
                {r.title && <h5 style={{ margin: '6px 0 2px' }}>{r.title}</h5>}
                <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', margin: '4px 0 0' }}>
                  {r.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default HotelDetails;
