import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

const ReceiptModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--success)" />
            <h3 style={{ margin: 0 }}>Official Electronic Receipt</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="receipt-paper" id="printable-receipt">
          <div className="receipt-header">
            <div className="receipt-brand">
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>TOURIST GUIDE & HOTEL BOOKING</h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Official Travel & Accommodation Invoice
              </p>
            </div>
            <div className="receipt-badge-status">
              <span className="badge-paid">
                <CheckCircle size={14} /> PAID & CONFIRMED
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px dashed var(--border)', margin: '16px 0' }} />

          {/* Reference Numbers */}
          <div className="receipt-grid-2">
            <div>
              <small className="r-label">Receipt Number</small>
              <p className="r-val"><strong>{receipt.receiptNumber}</strong></p>
            </div>
            <div>
              <small className="r-label">Transaction Reference</small>
              <p className="r-val"><code>{receipt.transactionReference}</code></p>
            </div>
            <div>
              <small className="r-label">Booking Reference</small>
              <p className="r-val"><code>{receipt.bookingReference}</code></p>
            </div>
            <div>
              <small className="r-label">Payment Date & Method</small>
              <p className="r-val">
                {new Date(receipt.paymentDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })} ({receipt.paymentMethod})
              </p>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

          {/* Hotel & Guest Details */}
          <div className="receipt-grid-2">
            <div>
              <small className="r-label">Reserved Hotel</small>
              <p className="r-val" style={{ fontWeight: 'bold' }}>{receipt.hotel?.name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {receipt.hotel?.address}, {receipt.hotel?.city}
              </p>
            </div>
            <div>
              <small className="r-label">Guest Details</small>
              <p className="r-val" style={{ fontWeight: 'bold' }}>{receipt.guest?.name}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {receipt.guest?.email} | {receipt.guest?.phone}
              </p>
            </div>
          </div>

          {/* Stay Breakdown Table */}
          <table className="receipt-table" style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px' }}>Room Type</th>
                <th style={{ padding: '8px' }}>Dates</th>
                <th style={{ padding: '8px' }}>Nights</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Rate/Night</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '10px 8px' }}><strong>{receipt.room?.roomType}</strong></td>
                <td style={{ padding: '10px 8px', fontSize: '0.85rem' }}>
                  {new Date(receipt.stayDetails?.checkIn).toLocaleDateString()} to{' '}
                  {new Date(receipt.stayDetails?.checkOut).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px 8px' }}>{receipt.stayDetails?.numberOfNights}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  ₹{receipt.stayDetails?.pricePerNight?.toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>
                  ₹{receipt.billing?.roomCharges?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total summary */}
          <div style={{ marginLeft: 'auto', width: '280px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
              <span>Room Subtotal:</span>
              <span>₹{receipt.billing?.roomCharges?.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.9rem' }}>
              <span>GST & Hospitality Tax (12%):</span>
              <span>₹{receipt.billing?.taxAmount?.toLocaleString('en-IN')}</span>
            </div>
            <hr style={{ border: 'none', borderTop: '2px solid var(--text-main)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '1.1rem', fontWeight: '800' }}>
              <span>Total Paid:</span>
              <span style={{ color: 'var(--primary)' }}>
                ₹{receipt.billing?.totalPaid?.toLocaleString('en-IN')} {receipt.billing?.currency}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            {receipt.billing?.simulationNote} • College Software Engineering Project
          </div>
        </div>

        {/* Modal Actions */}
        <div className="receipt-modal-footer no-print">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
