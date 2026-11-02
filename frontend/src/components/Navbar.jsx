import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Hotel,
  GitCompare,
  CalendarCheck,
  Award,
  User,
  LogOut,
  Building,
  Menu,
  X,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isManager, isTourist, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Compass size={22} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-name">TOURIST GUIDE</span>
            <span className="brand-sub">HOTEL BOOKING</span>
          </div>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links */}
        <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/destinations"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Destinations
            </NavLink>
            <NavLink
              to="/hotels"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Hotels
            </NavLink>
            <NavLink
              to="/hotels/compare"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <GitCompare size={15} style={{ marginRight: '4px' }} /> Compare
            </NavLink>

            {/* Tourist-only link */}
            {isAuthenticated && isTourist && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarCheck size={15} style={{ marginRight: '4px' }} /> My Bookings
              </NavLink>
            )}

            {/* Hotel Manager link */}
            {isAuthenticated && isManager && (
              <NavLink
                to="/manager/dashboard"
                className={({ isActive }) => `nav-link manager-badge-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building size={15} style={{ marginRight: '4px' }} /> Manager Portal
              </NavLink>
            )}
          </div>

          {/* User / Auth Action Controls */}
          <div className="nav-auth-actions">
            {isAuthenticated ? (
              <div className="user-profile-menu">
                {isTourist && (
                  <div className="points-pill" title="Loyalty Reward Points">
                    <Award size={14} color="#2563eb" />
                    <span>{user?.rewardPoints || 0} pts</span>
                  </div>
                )}

                <Link
                  to="/profile"
                  className="user-btn"
                  onClick={() => setMobileMenuOpen(false)}
                  title="View Profile"
                >
                  <User size={16} />
                  <span className="user-name-text">{user?.name?.split(' ')[0] || 'User'}</span>
                  <span className="role-chip">{user?.role}</span>
                </Link>

                <button
                  type="button"
                  className="btn-logout-icon"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className="btn-login-nav"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-register-nav"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
