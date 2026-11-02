import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = await login(email, password);
      if (userData.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for review presentation
  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-circle">
            <Compass size={28} color="#ffffff" />
          </div>
          <h2>Welcome Back</h2>
          <p>Log in to access your hotel bookings and saved destinations.</p>
        </div>

        {error && (
          <div className="alert-banner error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group" style={{ marginBottom: '16px' }}>
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

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Password</label>
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

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box for Review Presentation */}
        <div className="demo-fill-card">
          <small style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>
            Reviewer Demo Quick-Fill:
          </small>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn-demo-pill"
              onClick={() => handleQuickFill('tourist@demo.com')}
            >
              <UserCheck size={14} /> Tourist Demo
            </button>
            <button
              type="button"
              className="btn-demo-pill manager"
              onClick={() => handleQuickFill('manager@demo.com')}
            >
              <Building size={14} /> Hotel Manager Demo
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div className="auth-footer-link">
          Don't have an account yet?{' '}
          <Link to="/register" style={{ fontWeight: 'bold' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
