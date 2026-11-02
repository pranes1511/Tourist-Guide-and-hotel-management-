import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  QrCode,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Simulated card fields (dummy display only)
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('Aarav Sharma');
  const [expiry, setExpiry] = useState('12/28');
  const [upiId, setUpiId] = useState('tourist@okaxis');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.bookings.getById(bookingId);
        if (res.success) {
          if (res.data.status === 'confirmed') {
            // Already paid, redirect to confirmation
            navigate(`/confirmation/${bookingId}`);
            return;
          }
          setBooking(res.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve reservation');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Simulate realistic payment gateway processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await api.payments.process({
        bookingId,
        paymentMethod,
      });

      if (res.success) {
        navigate(`/confirmation/${bookingId}`);
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <p>Loading payment gateway...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Reservation Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
        <Link to="/hotels" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
          Back to Hotels
        </Link>
      </div>
    );
  }

  const basePrice = booking.totalAmount;
  const taxes = Math.round(basePrice * 0.12);
  const grandTotal = basePrice + taxes;

  return (
    <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/my-bookings" className="back-link">
          <ArrowLeft size={16} /> Cancel and return to My Bookings
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
          <ShieldCheck size={28} color="var(--success)" />
          <h1 style={{ margin: 0, fontSize: '2.2rem' }}>Secure Payment Simulation</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
          Booking Ref: <code>{booking.bookingReference}</code> • Complete simulated transaction to confirm your reservation.
        </p>
      </div>

      {error && (
        <div className="alert-banner error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* PCI-DSS Security Banner */}
      <div className="simulated-payment-banner">
        <Lock size={18} color="var(--success)" />
        <div>
          <strong>Verified Academic Demonstration Mode:</strong>
          <span style={{ marginLeft: '6px' }}>
            No real money is charged and no sensitive credit card credentials or CVVs are collected or saved.
          </span>
        </div>
      </div>

      <div className="payment-layout-grid">
        {/* Payment Methods Section */}
        <div className="payment-methods-col">
          <div className="content-box">
            <h3>Select Payment Method</h3>

            {/* Method Tabs */}
            <div className="payment-method-tabs">
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'Credit Card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Credit Card')}
              >
                <CreditCard size={18} />
                <span>Credit / Debit Card</span>
              </button>
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <QrCode size={18} />
                <span>UPI / QR Code</span>
              </button>
              <button
                type="button"
                className={`pm-tab ${paymentMethod === 'Net Banking' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Net Banking')}
              >
                <Building size={18} />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Method Inputs */}
            <form onSubmit={handleProcessPayment} style={{ marginTop: '24px' }}>
              {paymentMethod === 'Credit Card' && (
                <div className="payment-inputs-panel">
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Simulated Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV (Simulated)</label>
                      <input
                        type="password"
                        value="888"
                        readOnly
                        className="form-input"
                        title="CVV is never stored"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="payment-inputs-panel">
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Enter simulated Virtual Payment Address (VPA) or UPI ID:
                  </p>
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <label>UPI ID (e.g. name@okhdfcbank)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div className="payment-inputs-panel">
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Select your bank for simulated portal verification:
                  </p>
                  <select className="form-input" defaultValue="HDFC Bank">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '16px',
                  fontSize: '1.1rem',
                  justifyContent: 'center',
                }}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <RefreshCw size={18} className="spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock size={18} /> Pay ₹{grandTotal.toLocaleString('en-IN')} & Confirm
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary Column */}
        <aside className="payment-summary-col">
          <div className="summary-card">
            <h3>Booking Order Summary</h3>

            <div style={{ margin: '16px 0', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                {booking.hotelId?.name}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {booking.hotelId?.city}, {booking.hotelId?.address}
              </p>
            </div>

            <div style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Room:</span>
                <strong>{booking.roomId?.roomType}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nights:</span>
                <span>{booking.numberOfNights} Nights</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Check-in:</span>
                <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Check-out:</span>
                <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Price lines */}
            <div className="pricing-breakdown">
              <div className="price-line">
                <span>Room Charges:</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-line">
                <span>GST (12%):</span>
                <span>₹{taxes.toLocaleString('en-IN')}</span>
              </div>
              <div className="price-line-total">
                <span>Grand Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="var(--success)" /> 256-bit SSL Encrypted Connection
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PaymentPage;
