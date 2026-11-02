/**
 * Utility to format electronic receipt for confirmed bookings
 * @param {Object} booking - Mongoose Booking document
 * @param {Object} payment - Mongoose Payment document
 * @returns {Object} Structured receipt data
 */
export const formatElectronicReceipt = (booking, payment) => {
  const basePrice = booking.totalAmount;
  const taxRate = 0.12; // 12% GST / Hospitality Tax
  const taxAmount = Math.round(basePrice * taxRate);
  const grandTotal = basePrice + taxAmount;

  return {
    receiptNumber: payment.receiptNumber,
    transactionReference: payment.transactionReference,
    paymentDate: payment.paidAt || payment.createdAt,
    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.paymentStatus,
    bookingReference: booking.bookingReference,
    hotel: {
      name: booking.hotelId?.name || 'Hotel',
      address: booking.hotelId?.address || '',
      city: booking.hotelId?.city || '',
      contactPhone: booking.hotelId?.contactPhone || '',
    },
    room: {
      roomType: booking.roomId?.roomType || 'Room',
      capacity: booking.roomId?.capacity || 2,
    },
    guest: {
      name: booking.touristId?.name || 'Guest',
      email: booking.touristId?.email || '',
      phone: booking.touristId?.phone || '',
    },
    stayDetails: {
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      numberOfNights: booking.numberOfNights,
      guests: booking.guests,
      pricePerNight: booking.pricePerNight,
    },
    billing: {
      currency: payment.currency || 'INR',
      roomCharges: basePrice,
      taxAmount: taxAmount,
      totalPaid: grandTotal,
      isSimulated: true,
      simulationNote: 'Verified Academic Demonstration Transaction',
    },
  };
};
