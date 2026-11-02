import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Bed,
  CalendarCheck,
  TrendingUp,
  PlusCircle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.manager.getDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.warn('Error loading manager dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading Hotel Manager metrics...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalHotels: 0,
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
  };

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-tag">HOTEL MANAGER PORTAL</span>
            <span className="role-chip manager">AUTHORIZED</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginTop: '6px' }}>Welcome back, {user?.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Overview of your listed properties, room inventory, and guest reservations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/manager/hotels" className="btn-primary">
            <PlusCircle size={16} /> Manage Properties
          </Link>
          <Link to="/manager/reservations" className="btn-secondary">
            <CalendarCheck size={16} /> Guest Reservations
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="manager-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box blue">
            <Building size={24} />
          </div>
          <div>
            <span className="metric-label">Properties Listed</span>
            <div className="metric-value">{stats.totalHotels}</div>
            <small style={{ color: 'var(--text-muted)' }}>Active hotels in portfolio</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box teal">
            <Bed size={24} />
          </div>
          <div>
            <span className="metric-label">Active Room Types</span>
            <div className="metric-value">{stats.totalRooms}</div>
            <small style={{ color: 'var(--text-muted)' }}>Inventory across properties</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box green">
            <CalendarCheck size={24} />
          </div>
          <div>
            <span className="metric-label">Guest Reservations</span>
            <div className="metric-value">{stats.totalBookings}</div>
            <small style={{ color: 'var(--text-muted)' }}>{stats.confirmedBookings} Confirmed</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box amber">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="metric-label">Total Revenue</span>
            <div className="metric-value">₹{stats.totalRevenue?.toLocaleString('en-IN')}</div>
            <small style={{ color: 'var(--text-muted)' }}>From completed bookings</small>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="manager-layout-grid" style={{ marginTop: '36px' }}>
        {/* Left Column: Properties Summary */}
        <div className="content-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>My Listed Properties ({dashboardData?.hotels?.length || 0})</h3>
            <Link to="/manager/hotels" className="link-see-all">
              Manage All <ArrowRight size={14} />
            </Link>
          </div>

          {dashboardData?.hotels?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No properties listed under your account yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {dashboardData?.hotels?.map((h) => (
                <div key={h._id} className="manager-hotel-item">
                  <img
                    src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=160&auto=format&fit=crop&q=80'}
                    alt={h.name}
                    className="manager-hotel-thumb"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{h.name}</h4>
                      <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        ★ {h.starRating}★
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <MapPin size={12} /> {h.address}, {h.city}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem' }}>
                      <span>Base: <strong>₹{h.priceStartingFrom?.toLocaleString('en-IN')}</strong>/night</span>
                      <span>Rating: <strong>{h.averageRating ? h.averageRating.toFixed(1) : '4.8'}★</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Bookings Feed */}
        <div className="content-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Recent Guest Reservations</h3>
            <Link to="/manager/reservations" className="link-see-all">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {dashboardData?.recentBookings?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reservations recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dashboardData?.recentBookings?.map((b) => (
                <div key={b._id} className="recent-booking-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{b.touristId?.name || 'Guest'}</strong>
                    <span className={`status-pill ${b.status}`}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                    {b.hotelId?.name} • {b.roomId?.roomType}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>{new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}</span>
                    <strong style={{ color: 'var(--primary)' }}>₹{Math.round(b.totalAmount * 1.12).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
