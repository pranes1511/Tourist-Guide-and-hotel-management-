import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login preserving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--danger-bg)', borderRadius: '50%', color: 'var(--danger)', marginBottom: '16px' }}>
          <ShieldAlert size={36} />
        </div>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          You need <strong>{requiredRole === 'manager' ? 'Hotel Manager' : 'Tourist'}</strong> authorization to access this screen.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
