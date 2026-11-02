import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Navigation & Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Tourist Pages
import Home from './pages/Home';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import Hotels from './pages/Hotels';
import HotelDetails from './pages/HotelDetails';
import HotelComparison from './pages/HotelComparison';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';

// Hotel Manager Portal Pages
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerHotels from './pages/ManagerHotels';
import ManagerRooms from './pages/ManagerRooms';
import ManagerReservations from './pages/ManagerReservations';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Exploration Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/destinations/:id" element={<DestinationDetails />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/hotels/compare" element={<HotelComparison />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Tourist Routes */}
              <Route
                path="/book"
                element={
                  <ProtectedRoute requiredRole="tourist">
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment/:bookingId"
                element={
                  <ProtectedRoute requiredRole="tourist">
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation/:bookingId"
                element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute requiredRole="tourist">
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Hotel Manager Portal Routes */}
              <Route
                path="/manager/dashboard"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/hotels"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerHotels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/rooms/:hotelId"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager/reservations"
                element={
                  <ProtectedRoute requiredRole="manager">
                    <ManagerReservations />
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
