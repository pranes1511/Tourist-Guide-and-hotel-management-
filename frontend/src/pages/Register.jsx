import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  User,
  Mail,
  Lock,
  Phone,
  KeyRound,
  Building,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('tourist');
  const [managerSecretCode, setManagerSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (role === 'manager' && !managerSecretCode.trim()) {
      setError('Manager Secret Verification Code is required to register as Hotel Manager');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userData = await register({
        name,
        email,
        password,
        role,
        phone,
        managerSecretCode,
      });

      if (userData.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-logo-circle">
            <Compass size={28} color="#ffffff" />
          </div>
          <h2>Create Your Account</h2>
          <p>Register as a tourist to book hotels or as a hotel manager to list properties.</p>
        </div>

        {error && (
          <div className="alert-banner error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Role Selection Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'tourist' ? 'active' : ''}`}
            onClick={() => setRole('tourist')}
          >
            <UserCheck size={18} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Tourist</div>
              <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>Explore & Book Stays</small>
            </div>
          </button>

          <button
            type="button"
            className={`role-tab ${role === 'manager' ? 'active' : ''}`}
            onClick={() => setRole('manager')}
          >
            <Building size={18} />
            <div>
              <div style={{ fontWeight: 'bold' }}>Hotel Manager</div>
              <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>Manage Properties</small>
            </div>
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ marginBottom: '14px' }}>
            <div className="form-group">
              <label>Password (6+ chars)</label>
              <div className="input-with-icon">
                <Lock size={18} color="var(--text-muted)" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <div className="input-with-icon">
                <Phone size={18} color="var(--text-muted)" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Secure Manager Verification Code (Shown only if role === manager) */}
          {role === 'manager' && (
            <div className="manager-code-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--primary-dark)', marginBottom: '6px' }}>
                <KeyRound size={16} /> Manager Authorization Verification Code
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 10px' }}>
                Required to prevent unauthorized hotel manager role escalation. (Demo Code: <code>HOTEL_MANAGER_SECURE_2026</code>)
              </p>
              <input
                type="text"
                placeholder="Enter Manager Secret Verification Code"
                value={managerSecretCode}
                onChange={(e) => setManagerSecretCode(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Creating Account...' : `Register as ${role === 'manager' ? 'Hotel Manager' : 'Tourist'}`}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 'bold' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
