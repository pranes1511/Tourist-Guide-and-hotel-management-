import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Star,
  Compass,
  Lightbulb,
  Heart,
  Hotel as HotelIcon,
  MessageSquare,
  Send,
  Sparkles,
  ArrowLeft,
  Info,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import HotelCard from '../components/HotelCard';

const DestinationDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated, toggleFavorite } = useAuth();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDestination = async () => {
    try {
      const res = await api.destinations.getById(id);
      if (res.success) {
        setDestination(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load destination details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.reviews.create({
        targetType: 'Destination',
        destinationId: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });

      if (res.success) {
        setReviewSuccess(true);
        setReviewTitle('');
        setReviewComment('');
        fetchDestination(); // Refresh reviews and rating
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
        <p>Loading destination details & attractions...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Destination Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error || 'Unable to locate destination records.'}</p>
        <Link to="/destinations" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Destinations
        </Link>
      </div>
    );
  }

  const isFav = user?.favorites?.some((f) => (typeof f === 'string' ? f : f?._id) === destination._id);

  return (
    <div className="dest-details-page">
      {/* Hero Banner */}
      <div
        className="dest-hero-banner"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url(${destination.imageUrl})`,
        }}
      >
        <div className="dest-hero-content">
          <Link to="/destinations" className="back-link">
            <ArrowLeft size={16} /> Back to Destinations
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <span className="dest-category-pill">{destination.category}</span>
            <span style={{ color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
              <Star size={16} fill="#f59e0b" /> {destination.averageRating ? destination.averageRating.toFixed(1) : '4.8'}
              <small style={{ color: '#ffffff', opacity: 0.8 }}>({destination.totalReviews || 0} reviews)</small>
            </span>
          </div>

          <h1 className="dest-hero-title">{destination.name}</h1>

          <div className="dest-hero-meta">
            <span>
              <MapPin size={16} /> {destination.city}, {destination.state}
            </span>
            <span>
              <Calendar size={16} /> Best Season: <strong>{destination.bestSeason}</strong>
            </span>
            {user?.role === 'tourist' && (
              <button
                type="button"
                className={`btn-fav-large ${isFav ? 'active' : ''}`}
                onClick={() => toggleFavorite(destination._id)}
              >
                <Heart size={16} fill={isFav ? '#ef4444' : 'none'} color={isFav ? '#ef4444' : '#ffffff'} />
                {isFav ? 'Saved in Favorites' : 'Add to Favorites'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="dest-layout-grid">
          {/* Main Content Column */}
          <div className="dest-main-col">
            {/* Overview */}
            <section className="content-box">
              <h2>About {destination.name}</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.7', marginTop: '12px' }}>
                {destination.description}
              </p>
            </section>

            {/* Tourist Attractions */}
            <section className="content-box" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={22} color="var(--primary)" />
                <h2 style={{ margin: 0 }}>Top Tourist Attractions</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Curated highlights, historic landmarks, and activities in and around {destination.city}.
              </p>

              <div className="attractions-list">
                {destination.attractions?.map((attraction, idx) => (
                  <div key={idx} className="attraction-item-card">
                    {attraction.imageUrl && (
                      <img
                        src={attraction.imageUrl}
                        alt={attraction.name}
                        className="attraction-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    )}
                    <div className="attraction-details">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{attraction.name}</h3>
                        <span className="attraction-tag">{attraction.category || 'Sightseeing'}</span>
                      </div>

                      {attraction.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <MapPin size={13} color="var(--primary)" />
                          <span>{attraction.location}</span>
                        </div>
                      )}

                      <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.92rem', lineHeight: 1.55 }}>
                        {attraction.description}
                      </p>

                      {attraction.visitorInfo && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '8px 12px',
                            background: 'rgba(37, 99, 235, 0.05)',
                            borderLeft: '3px solid var(--primary)',
                            borderRadius: '4px',
                            fontSize: '0.82rem',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                          }}
                        >
                          <Info size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span><strong>Visitor Info:</strong> {attraction.visitorInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Nearby Hotels */}
            <section className="content-box" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HotelIcon size={22} color="var(--primary)" />
                  <h2 style={{ margin: 0 }}>Hotels in {destination.city}</h2>
                </div>
                <Link to={`/hotels?city=${destination.city}`} className="link-see-all">
                  View All Stays in {destination.city}
                </Link>
              </div>

              {destination.nearbyHotels?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hotels listed yet for this destination.</p>
              ) : (
                <div className="nearby-hotels-list">
                  {destination.nearbyHotels?.map((h) => (
                    <div key={h._id} className="nearby-hotel-card">
                      <img
                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&auto=format&fit=crop&q=80'}
                        alt={h.name}
                        className="nearby-hotel-img"
                      />
                      <div className="nearby-hotel-info">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ margin: 0 }}>{h.name}</h4>
                          <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ★ {h.starRating}★
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0' }}>
                          Starting from <strong>₹{h.priceStartingFrom?.toLocaleString('en-IN')}</strong> / night
                        </p>
                        <Link to={`/hotels/${h._id}`} className="btn-explore-sm">
                          Reserve Room
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="content-box" style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquare size={22} color="var(--primary)" />
                <h2 style={{ margin: 0 }}>Traveler Reviews & Ratings</h2>
              </div>

              {/* Review Submission Form (Tourist only) */}
              {isAuthenticated && user?.role === 'tourist' ? (
                <form className="review-form-card" onSubmit={handleReviewSubmit}>
                  <h4>Share Your Experience at {destination.name}</h4>
                  {reviewSuccess && (
                    <div className="alert-success" style={{ margin: '12px 0' }}>
                      Thank you! Your review has been published.
                    </div>
                  )}

                  <div style={{ margin: '12px 0' }}>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '6px' }}>
                      Your Rating:
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
                      placeholder="Title (e.g. Unforgettable Sunset & Heritage Walk)"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <textarea
                      placeholder="Write your honest review and helpful travel advice for other tourists..."
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="form-input"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary" disabled={submittingReview}>
                    <Send size={15} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : !isAuthenticated ? (
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                  <Link to="/login" style={{ fontWeight: 'bold' }}>Log in</Link> as a tourist to leave a rating and review for this destination.
                </p>
              ) : null}

              {/* Reviews List */}
              <div className="reviews-feed">
                {destination.reviews?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  destination.reviews?.map((r) => (
                    <div key={r._id} className="review-bubble">
                      <div className="review-bubble-head">
                        <div>
                          <strong>{r.touristId?.name || 'Verified Tourist'}</strong>
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

          {/* Sidebar Column: Travel Tips & Guidance */}
          <div className="dest-side-col">
            <div className="side-tips-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Lightbulb size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Travel Tips & Guidance</h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <small className="r-label">Best Time To Visit</small>
                <p style={{ fontWeight: '600', color: 'var(--primary)', margin: '2px 0 0' }}>
                  {destination.bestSeason}
                </p>
              </div>

              <small className="r-label">Local Advice</small>
              <ul className="travel-tips-list">
                {destination.travelTips?.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <Link to={`/hotels?city=${destination.city}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <HotelIcon size={16} /> Book Hotel in {destination.city}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
