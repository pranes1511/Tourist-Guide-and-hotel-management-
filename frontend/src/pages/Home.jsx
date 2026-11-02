import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Compass,
  Hotel,
  ShieldCheck,
  Star,
  Award,
  Sparkles,
  ArrowRight,
  Waves,
  Mountain,
  Landmark,
  Church,
  Sunrise,
  Trees,
  Droplets
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';

const categoryIcons = {
  'Hill Stations': Sunrise,
  'Temples': Church,
  'Heritage': Landmark,
  'Beaches': Waves,
  'Waterfalls': Droplets,
  'Nature and Wildlife': Trees,
  'Adventure': Compass,
  'Cultural Tourism': Sparkles,
  'Mountains': Mountain,
  'Hills': Sunrise,
  'Wildlife': Trees,
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [destRes, hotelsRes] = await Promise.all([
          api.destinations.getAll({ sort: 'popular' }),
          api.hotels.getAll({ sort: 'rating' }),
        ]);

        if (destRes.success) {
          setPopularDestinations(destRes.data.slice(0, 4));
        }
        if (hotelsRes.success) {
          setFeaturedHotels(hotelsRes.data.slice(0, 3));
        }
      } catch (error) {
        console.warn('Failed to load home data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
    navigate(`/destinations?${params.toString()}`);
  };

  const categories = [
    { name: 'Hill Stations', desc: 'Misty peaks & tea valleys' },
    { name: 'Temples', desc: 'Sacred architectural wonders' },
    { name: 'Heritage', desc: 'Chola temples, palaces & forts' },
    { name: 'Beaches', desc: 'Sun, sand & ocean shores' },
    { name: 'Waterfalls', desc: 'Cascading natural falls' },
    { name: 'Nature and Wildlife', desc: 'Rainforests & sanctuaries' },
    { name: 'Adventure', desc: 'Hill treks & canyon rafting' },
    { name: 'Cultural Tourism', desc: 'Silk weaving & monuments' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles size={16} /> All-in-One Travel & Hospitality Platform
          </div>
          <h1 className="hero-title">
            Discover Incredible Destinations & <br />
            Reserve Luxury Hotel Stays
          </h1>
          <p className="hero-subtitle">
            Curated guidance for India’s finest destinations, attractions, and verified hotels with real-time room availability.
          </p>

          {/* Search Box */}
          <form className="hero-search-card" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <label>Where do you want to go?</label>
              <div className="input-with-icon">
                <MapPin size={18} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="e.g. Ooty, Madurai, Goa, Jaipur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label>Category</label>
              <div className="input-with-icon">
                <Compass size={18} color="var(--primary)" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Hill Stations">Hill Stations</option>
                  <option value="Temples">Temples</option>
                  <option value="Heritage">Heritage</option>
                  <option value="Beaches">Beaches</option>
                  <option value="Waterfalls">Waterfalls</option>
                  <option value="Nature and Wildlife">Nature and Wildlife</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Cultural Tourism">Cultural Tourism</option>
                  <option value="Mountains">Mountains</option>
                  <option value="Hills">Hills</option>
                  <option value="Wildlife">Wildlife</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-search-hero">
              <Search size={18} /> Find Destinations
            </button>
          </form>

          {/* Quick Stats Bar */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">26+</span>
              <span className="stat-text">Curated Destinations</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-text">Luxury & Boutique Hotels</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-text">Verified Availability</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5%</span>
              <span className="stat-text">Tourist Reward Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Exploration */}
      <section className="section-container">
        <div className="section-head">
          <div>
            <span className="section-tag">EXPLORE BY INTEREST</span>
            <h2 className="section-title">Popular Travel Categories</h2>
          </div>
          <Link to="/destinations" className="link-see-all">
            Browse All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name] || Compass;
            return (
              <Link
                key={cat.name}
                to={`/destinations?category=${cat.name}`}
                className="category-card"
              >
                <div className="category-icon-wrap">
                  <Icon size={28} />
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Destinations Grid */}
      <section className="section-container">
        <div className="section-head">
          <div>
            <span className="section-tag">MUST-VISIT PLACES</span>
            <h2 className="section-title">Top Rated Tourist Destinations</h2>
          </div>
          <Link to="/destinations" className="link-see-all">
            View All Destinations <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading destinations...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {popularDestinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Hotels */}
      <section className="section-container bg-subtle-section">
        <div className="section-head">
          <div>
            <span className="section-tag">LUXURY & COMFORT</span>
            <h2 className="section-title">Featured Hotels & Resorts</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/hotels/compare" className="btn-secondary">
              Compare Stays
            </Link>
            <Link to="/hotels" className="btn-primary">
              View All Hotels
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading hotels...</p>
          </div>
        ) : (
          <div className="hotels-grid">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Four Goals / Features Section */}
      <section className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag">CORE VALUE PROPOSITION</span>
          <h2 className="section-title">Engineered for Seamless Travel Planning</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon blue">
              <Compass size={24} />
            </div>
            <h3>1. Simplified Travel Planning</h3>
            <p>
              Explore destinations, local attractions, cultural notes, and season recommendations on a single responsive platform.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon teal">
              <Hotel size={24} />
            </div>
            <h3>2. Seamless Hotel Booking</h3>
            <p>
              Compare hotel amenities, ratings, and room inventories with strict atomic double-booking prevention.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon green">
              <ShieldCheck size={24} />
            </div>
            <h3>3. Trustworthy Guidance</h3>
            <p>
              Read authentic traveler reviews and comprehensive travel tips curated for popular tourist hubs.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon amber">
              <Award size={24} />
            </div>
            <h3>4. Secure & Scalable System</h3>
            <p>
              Role-based authentication, simulated PCI-compliant checkout, and electronic receipts with instant loyalty points.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
