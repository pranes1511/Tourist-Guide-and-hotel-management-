import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Award,
  Heart,
  Save,
  LogOut,
  MapPin,
  CheckCircle,
  Compass
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [favoritesList, setFavoritesList] = useState([]);
  const [loadingFavs, setLoadingFavs] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }

    const loadFavorites = async () => {
      setLoadingFavs(true);
      try {
        const res = await api.auth.getMe();
        if (res.success && res.data.favorites) {
          setFavoritesList(res.data.favorites);
        }
      } catch (err) {
        console.warn('Could not load favorites:', err.message);
      } finally {
        setLoadingFavs(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const updateData = { name, phone };
      if (password) updateData.password = password;

      await updateProfile(updateData);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-avatar-circle">
          <User size={36} color="#ffffff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{user?.name}</h1>
            <span className={`role-chip ${user?.role}`}>{user?.role?.toUpperCase()}</span>
          </div>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            <Mail size={14} style={{ marginRight: '4px' }} /> {user?.email}
          </p>
        </div>

        <button type="button" className="btn-secondary" onClick={handleLogout}>
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Rewards Banner (for tourists) */}
      {user?.role === 'tourist' && (
        <div className="loyalty-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="loyalty-icon-box">
              <Award size={26} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#ffffff' }}>Loyalty Reward Points</h3>
              <p style={{ margin: '2px 0 0', color: '#e0e7ff', fontSize: '0.88rem' }}>
                Earn 5% points back on every hotel reservation to unlock special discounts.
              </p>
            </div>
          </div>
          <div className="points-display">
            <span className="points-number">{user?.rewardPoints || 0}</span>
            <span className="points-unit">PTS</span>
          </div>
        </div>
      )}

      <div className="profile-grid" style={{ marginTop: '32px' }}>
        {/* Left: Edit Account Info */}
        <div className="content-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={20} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Account Information</h3>
          </div>

          {successMsg && (
            <div className="alert-success" style={{ marginBottom: '16px' }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="form-input"
                style={{ background: 'var(--bg-subtle)', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                placeholder="Enter new password if changing"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Right: Saved Favorite Destinations */}
        <div className="content-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
            <h3 style={{ margin: 0 }}>Saved Favorite Destinations</h3>
          </div>

          {loadingFavs ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading favorites...</p>
          ) : favoritesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)' }}>
              <Compass size={36} color="var(--text-subtle)" style={{ marginBottom: '8px' }} />
              <p>You haven't saved any destinations yet.</p>
              <Link to="/destinations" className="btn-secondary" style={{ marginTop: '10px', display: 'inline-flex' }}>
                Browse Destinations
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {favoritesList.map((fav) => (
                <Link
                  key={fav._id}
                  to={`/destinations/${fav._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <img
                    src={fav.imageUrl || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=120&auto=format&fit=crop&q=80'}
                    alt={fav.name}
                    style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{fav.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} /> {fav.city}, {fav.state}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
