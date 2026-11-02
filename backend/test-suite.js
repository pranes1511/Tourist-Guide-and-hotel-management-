/**
 * Comprehensive Automated System Test Suite
 * Tests all 20 functionality criteria required by the Master Project prompt.
 */

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import memoryStore from './utils/memoryStore.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/manager', managerRoutes);

const PORT = 5055;
const server = app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`🧪 RUNNING SYSTEM TEST SUITE ON PORT ${PORT}`);
  console.log(`==================================================\n`);

  const BASE_URL = `http://localhost:${PORT}/api`;
  let passedCount = 0;
  let failedCount = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      failedCount++;
    }
  };

  try {
    // 1. Health check
    await test('1. Health check responds with HTTP 200', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      const data = await res.json();
      if (res.status !== 200 || data.status !== 'OK') throw new Error('Health check failed');
    });

    // 2. Destinations list
    let sampleDestId;
    await test('2. Destination browsing & category filtering', async () => {
      const res = await fetch(`${BASE_URL}/destinations?category=Beaches`);
      const data = await res.json();
      if (!data.success || data.count === 0) throw new Error('No beach destinations returned');
      sampleDestId = data.data[0]._id;
    });

    // 3. Destination details
    await test('3. Destination details with attractions & tips', async () => {
      const res = await fetch(`${BASE_URL}/destinations/${sampleDestId}`);
      const data = await res.json();
      if (!data.success || !data.data.attractions || data.data.attractions.length === 0) {
        throw new Error('Destination details missing attractions');
      }
    });

    // 4. Hotels search & filter
    let sampleHotelId;
    await test('4. Hotel search with city & star rating filter', async () => {
      const res = await fetch(`${BASE_URL}/hotels?city=Panaji&starRating=4`);
      const data = await res.json();
      if (!data.success || data.count === 0) throw new Error('No hotels matching filter');
      sampleHotelId = data.data[0]._id;
    });

    // 5. Hotel details & rooms
    let sampleRoomId;
    await test('5. Hotel details and room inventory inspection', async () => {
      const res = await fetch(`${BASE_URL}/hotels/${sampleHotelId}`);
      const data = await res.json();
      if (!data.success || !data.data.rooms || data.data.rooms.length === 0) {
        throw new Error('Hotel missing rooms');
      }
      sampleRoomId = data.data.rooms[0]._id;
    });

    // 6. Hotel comparison
    await test('6. Hotel side-by-side comparison tool', async () => {
      const res = await fetch(`${BASE_URL}/hotels/compare?ids=${memoryStore.hotels[0]._id},${memoryStore.hotels[1]._id}`);
      const data = await res.json();
      if (!data.success || data.count < 2) throw new Error('Comparison did not return 2 hotels');
    });

    // 7. Prevent unauthorized hotel manager registration
    await test('7. Prevent unauthorized hotel manager registration (No secret code)', async () => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Hacker',
          email: 'hacker@test.com',
          password: 'password123',
          role: 'manager',
          managerSecretCode: 'WRONG_CODE',
        }),
      });
      if (res.status !== 403) throw new Error('Should reject manager registration with 403 Forbidden');
    });

    // 8. Tourist registration
    let touristToken;
    let touristId;
    await test('8. Tourist account registration with JWT', async () => {
      const testEmail = `tourist_${Date.now()}@test.com`;
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Tourist',
          email: testEmail,
          password: 'password123',
          role: 'tourist',
          phone: '+91 99999 88888',
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data.token) throw new Error('Registration failed');
      touristToken = data.data.token;
      touristId = data.data._id;
    });

    // 9. Tourist login
    await test('9. Tourist login authentication', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tourist@demo.com',
          password: 'password123',
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data.token) throw new Error('Tourist demo login failed');
      touristToken = data.data.token; // Use standard demo token
      touristId = data.data._id;
    });

    // 10. Room availability check
    await test('10. Room availability checking for valid dates', async () => {
      const res = await fetch(`${BASE_URL}/rooms/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: sampleRoomId,
          checkIn: '2026-12-10',
          checkOut: '2026-12-14',
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data.isAvailable) throw new Error('Room availability check failed');
    });

    // 11. Booking creation
    let bookingId;
    await test('11. Booking reservation creation (Status: pending)', async () => {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${touristToken}`,
        },
        body: JSON.stringify({
          hotelId: sampleHotelId,
          roomId: sampleRoomId,
          checkIn: '2026-12-10',
          checkOut: '2026-12-14',
          guests: 2,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data._id) throw new Error(data.message || 'Booking creation failed');
      bookingId = data.data._id;
      if (data.data.status !== 'pending') throw new Error('Initial status should be pending');
    });

    // 12. Payment processing & receipt generation
    await test('12. Simulated payment processing & electronic receipt generation', async () => {
      const res = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${touristToken}`,
        },
        body: JSON.stringify({
          bookingId,
          paymentMethod: 'Credit Card',
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data.receipt || !data.data.receipt.receiptNumber) {
        throw new Error('Payment processing or receipt generation failed');
      }
    });

    // 13. Double booking prevention
    await test('13. Double-booking prevention: inventory depletion verification', async () => {
      // Find room totalRooms
      const room = memoryStore.rooms.find((r) => r._id === sampleRoomId);
      // Simulate bookings up to total capacity
      const existingOverlaps = memoryStore.bookings.filter(
        (b) => b.roomId === sampleRoomId && b.status === 'confirmed'
      ).length;

      // Fill remaining rooms
      for (let i = existingOverlaps; i < room.totalRooms; i++) {
        memoryStore.bookings.push({
          _id: `test_b_${Date.now()}_${i}`,
          bookingReference: `BK-TEST-${i}`,
          touristId,
          hotelId: sampleHotelId,
          roomId: sampleRoomId,
          checkIn: new Date('2026-12-10'),
          checkOut: new Date('2026-12-14'),
          guests: 1,
          numberOfNights: 4,
          pricePerNight: room.pricePerNight,
          totalAmount: room.pricePerNight * 4,
          status: 'confirmed',
          createdAt: new Date(),
        });
      }

      // Now attempting to book again for same dates should be REJECTED!
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${touristToken}`,
        },
        body: JSON.stringify({
          hotelId: sampleHotelId,
          roomId: sampleRoomId,
          checkIn: '2026-12-10',
          checkOut: '2026-12-14',
          guests: 2,
        }),
      });
      if (res.status === 201) throw new Error('Expected double-booking to be blocked, but booking succeeded!');
    });

    // 14. Booking cancellation
    await test('14. Tourist booking cancellation', async () => {
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${touristToken}`,
        },
        body: JSON.stringify({ reason: 'Change of plans' }),
      });
      const data = await res.json();
      if (!data.success || data.data.status !== 'cancelled') throw new Error('Cancellation failed');
    });

    // 15. Review submission
    await test('15. Tourist review and star rating submission', async () => {
      const res = await fetch(`${BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${touristToken}`,
        },
        body: JSON.stringify({
          targetType: 'Hotel',
          hotelId: sampleHotelId,
          rating: 5,
          title: 'Unbelievable Experience',
          comment: 'The hospitality and beach sunset views were truly 5 stars!',
        }),
      });
      const data = await res.json();
      if (!data.success || !data.data._id) throw new Error('Review submission failed');
    });

    // 16. Hotel Manager login
    let managerToken;
    await test('16. Hotel Manager login authentication', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'manager@demo.com',
          password: 'password123',
        }),
      });
      const data = await res.json();
      if (!data.success || data.data.role !== 'manager') throw new Error('Manager login failed');
      managerToken = data.data.token;
    });

    // 17. Hotel Manager dashboard metrics
    await test('17. Hotel Manager dashboard analytics & metrics retrieval', async () => {
      const res = await fetch(`${BASE_URL}/manager/dashboard`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      const data = await res.json();
      if (!data.success || data.data.stats.totalHotels === undefined) {
        throw new Error('Manager dashboard stats retrieval failed');
      }
    });

    // 18. Hotel Manager hotel management
    await test('18. Hotel Manager property management', async () => {
      const res = await fetch(`${BASE_URL}/manager/hotels`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error('Failed to load manager hotels');
    });

    // 19. Hotel Manager reservations
    await test('19. Hotel Manager guest reservation management', async () => {
      const res = await fetch(`${BASE_URL}/manager/bookings`, {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error('Failed to load manager reservations');
    });

    // 20. Role access control (Tourist cannot access manager portal)
    await test('20. Role-based access control: Tourist blocked from Manager APIs', async () => {
      const res = await fetch(`${BASE_URL}/manager/dashboard`, {
        headers: { Authorization: `Bearer ${touristToken}` },
      });
      if (res.status !== 403) throw new Error('Expected 403 Forbidden for tourist accessing manager API');
    });

    // 21. Tamil Nadu Destinations Count Test
    await test('21. Tamil Nadu State Filter returns all 20 destinations', async () => {
      const res = await fetch(`${BASE_URL}/destinations?state=Tamil%20Nadu`);
      const data = await res.json();
      if (!data.success || data.count !== 20) {
        throw new Error(`Expected exactly 20 Tamil Nadu destinations, got ${data.count}`);
      }
      const expectedDests = [
        'Ooty', 'Kodaikanal', 'Yercaud', 'Yelagiri', 'Coonoor',
        'Valparai', 'Kolli Hills', 'Chennai', 'Madurai', 'Chidambaram',
        'Thanjavur', 'Kanchipuram', 'Rameswaram', 'Kanyakumari', 'Mahabalipuram',
        'Kumbakonam', 'Tiruvannamalai', 'Coimbatore', 'Hogenakkal', 'Courtallam'
      ];
      for (const expected of expectedDests) {
        const found = data.data.some(d => d.name.toLowerCase().includes(expected.toLowerCase()));
        if (!found) throw new Error(`Missing Tamil Nadu destination: ${expected}`);
      }
    });

    // 22. Search by Attraction Name Test
    await test('22. Search by attraction name matches correct destination', async () => {
      const testCases = [
        { attraction: 'Meenakshi Amman Temple', expectedCity: 'Madurai' },
        { attraction: 'Brihadeeswarar Temple', expectedCity: 'Thanjavur' },
        { attraction: 'Pichavaram Mangrove Forest', expectedCity: 'Chidambaram' },
        { attraction: 'Shore Temple', expectedCity: 'Mahabalipuram' },
        { attraction: 'Hogenakkal Falls', expectedCity: 'Hogenakkal' },
        { attraction: 'Courtallam Falls', expectedCity: 'Courtallam' },
        { attraction: 'Monkey Falls', expectedCity: 'Valparai' },
        { attraction: 'Doddabetta Peak', expectedCity: 'Ooty' },
      ];

      for (const tc of testCases) {
        const res = await fetch(`${BASE_URL}/destinations?search=${encodeURIComponent(tc.attraction)}`);
        const data = await res.json();
        if (!data.success || data.count === 0) {
          throw new Error(`Search for attraction "${tc.attraction}" returned 0 results`);
        }
        const match = data.data.some(d => d.city.toLowerCase() === tc.expectedCity.toLowerCase());
        if (!match) {
          throw new Error(`Search for "${tc.attraction}" did not return expected city ${tc.expectedCity}`);
        }
      }
    });

    // 23. Attraction Details & Visitor Info Test
    await test('23. Attraction details include location and visitor information', async () => {
      const res = await fetch(`${BASE_URL}/destinations?search=Ooty`);
      const data = await res.json();
      if (!data.success || data.count === 0) throw new Error('Ooty not found');
      const ootyId = data.data[0]._id;

      const detailRes = await fetch(`${BASE_URL}/destinations/${ootyId}`);
      const detailData = await detailRes.json();
      if (!detailData.success) throw new Error('Failed to load Ooty details');

      const attractions = detailData.data.attractions;
      if (!attractions || attractions.length < 3) {
        throw new Error(`Expected at least 3 attractions for Ooty, got ${attractions ? attractions.length : 0}`);
      }

      const ootyLake = attractions.find(a => a.name.includes('Ooty Lake'));
      if (!ootyLake || !ootyLake.location || !ootyLake.visitorInfo) {
        throw new Error('Ooty Lake missing location or visitor information');
      }
    });

    // 24. Category Filtering for New Categories
    await test('24. Category filters (Hill Stations, Temples, Waterfalls) return valid records', async () => {
      const categoriesToTest = ['Hill Stations', 'Temples', 'Waterfalls', 'Heritage'];
      for (const cat of categoriesToTest) {
        const res = await fetch(`${BASE_URL}/destinations?category=${encodeURIComponent(cat)}`);
        const data = await res.json();
        if (!data.success || data.count === 0) {
          throw new Error(`No destinations found for category "${cat}"`);
        }
      }
    });

    // 25. Existing Destinations & Hotels Preserved
    await test('25. Existing destinations and hotels are intact and functional', async () => {
      const res = await fetch(`${BASE_URL}/destinations`);
      const data = await res.json();
      if (!data.success || data.count < 26) {
        throw new Error(`Expected at least 26 total destinations (6 existing + 20 Tamil Nadu), got ${data.count}`);
      }

      // Check original destinations exist
      const originalDests = ['Goa', 'Jaipur', 'Manali', 'Munnar', 'Agra', 'Varanasi'];
      for (const orig of originalDests) {
        const found = data.data.some(d => d.name.toLowerCase().includes(orig.toLowerCase()));
        if (!found) throw new Error(`Existing destination "${orig}" was missing or deleted`);
      }

      // Check hotels still load
      const hotelRes = await fetch(`${BASE_URL}/hotels`);
      const hotelData = await hotelRes.json();
      if (!hotelData.success || hotelData.count === 0) {
        throw new Error('Hotels collection is empty or failed to load');
      }
    });

  } catch (globalErr) {
    console.error('Fatal Test Suite Error:', globalErr);
  } finally {
    console.log(`\n==================================================`);
    console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log(`==================================================\n`);
    server.close(() => {
      process.exit(failedCount === 0 ? 0 : 1);
    });
  }
});
