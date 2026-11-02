/**
 * Centralized API service for communicating with Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to get auth headers with JWT token
const getHeaders = () => {
  const token = localStorage.getItem('tourist_guide_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch wrapper with error handling
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : { message: await response.text() };

  if (!response.ok) {
    throw new Error(data?.message || `HTTP Error ${response.status}`);
  }

  return data;
};

// API Services Export
export const api = {
  // Authentication
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    toggleFavorite: (destId) => request(`/auth/favorites/${destId}`, { method: 'POST' }),
  },

  // Destinations
  destinations: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/destinations${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/destinations/${id}`),
    getCategories: () => request('/destinations/categories'),
    create: (data) => request('/destinations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/destinations/${id}`, { method: 'DELETE' }),
  },

  // Hotels
  hotels: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/hotels${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/hotels/${id}`),
    compare: (ids) => request(`/hotels/compare?ids=${ids.join(',')}`),
    create: (data) => request('/hotels', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/hotels/${id}`, { method: 'DELETE' }),
  },

  // Rooms
  rooms: {
    getByHotel: (hotelId, params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/rooms/hotel/${hotelId}${query ? `?${query}` : ''}`);
    },
    checkAvailability: (payload) =>
      request('/rooms/check-availability', { method: 'POST', body: JSON.stringify(payload) }),
    create: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getMyBookings: () => request('/bookings/my'),
    getById: (id) => request(`/bookings/${id}`),
    cancel: (id, reason) =>
      request(`/bookings/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
  },

  // Payments
  payments: {
    process: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload) }),
    getReceipt: (bookingId) => request(`/payments/${bookingId}`),
  },

  // Reviews
  reviews: {
    create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    getHotelReviews: (hotelId) => request(`/reviews/hotel/${hotelId}`),
    getDestinationReviews: (destId) => request(`/reviews/destination/${destId}`),
  },

  // Manager Portal
  manager: {
    getDashboard: () => request('/manager/dashboard'),
    getHotels: () => request('/manager/hotels'),
    getBookings: (status) => request(`/manager/bookings${status ? `?status=${status}` : ''}`),
    updateBookingStatus: (id, status) =>
      request(`/manager/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },
};

export default api;
