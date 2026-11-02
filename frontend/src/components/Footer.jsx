import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, Code2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand & Project Info */}
          <div className="footer-brand-col">
            <div className="footer-brand">
              <Compass size={22} color="var(--primary)" />
              <span className="brand-name">Tourist Guide & Hotel Booking</span>
            </div>
            <p className="footer-desc">
              A comprehensive MERN-stack travel platform for discovering Indian tourist destinations, exploring local attractions, and reserving hotel rooms with automated availability checking.
            </p>
            <div className="academic-badge">
              <Code2 size={15} />
              <span>College Software Engineering Project • Review 1 Specification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/destinations">Explore Destinations</Link></li>
              <li><Link to="/hotels">Browse Hotels</Link></li>
              <li><Link to="/hotels/compare">Compare Hotels</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="footer-col">
            <h4>Popular Hubs</h4>
            <ul className="footer-links">
              <li><Link to="/destinations?category=Beaches">Goa Coastal Beaches</Link></li>
              <li><Link to="/destinations?category=Heritage">Jaipur Heritage Forts</Link></li>
              <li><Link to="/destinations?category=Mountains">Manali Alpine Valley</Link></li>
              <li><Link to="/destinations?category=Hills">Munnar Tea Plantations</Link></li>
              <li><Link to="/destinations?category=Temples">Varanasi Ghats</Link></li>
            </ul>
          </div>

          {/* Platform Info & Demo */}
          <div className="footer-col">
            <h4>Platform Details</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <strong>Demo Accounts:</strong><br />
              Tourist: <code>tourist@demo.com</code><br />
              Manager: <code>manager@demo.com</code>
            </p>
            <div className="sim-notice">
              <ShieldCheck size={16} color="var(--success)" />
              <span>PCI-DSS Simulated Payment Demo • No Real Cards Stored</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Tourist Guide and Hotel Booking System. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with React.js, Express.js & MongoDB
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
