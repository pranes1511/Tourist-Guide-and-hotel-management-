import bcrypt from 'bcryptjs';
import { usersData, destinationsData, hotelsData, roomTemplates } from '../seed/seedData.js';

/**
 * In-Memory Fallback Store
 * Activated automatically if local MongoDB is offline or unavailable.
 * Ensures the student's project demonstration and college evaluation is 100% resilient.
 */

class MemoryStore {
  constructor() {
    this.users = [];
    this.destinations = [];
    this.hotels = [];
    this.rooms = [];
    this.bookings = [];
    this.payments = [];
    this.reviews = [];
    this.init();
  }

  async init() {
    // 1. Initialize Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    this.users = usersData.map((u, idx) => ({
      _id: `user_${idx + 1}`,
      name: u.name,
      email: u.email.toLowerCase(),
      password: hashedPassword,
      role: u.role,
      phone: u.phone,
      rewardPoints: u.rewardPoints || 0,
      isManagerApproved: u.isManagerApproved,
      favorites: [],
      createdAt: new Date(),
    }));

    const manager = this.users.find((u) => u.role === 'manager');
    const tourist = this.users.find((u) => u.role === 'tourist');

    // 2. Initialize Destinations
    this.destinations = destinationsData.map((d, idx) => ({
      _id: `dest_${idx + 1}`,
      ...d,
      createdAt: new Date(),
    }));

    // Map city to destination ID
    const cityMap = {};
    this.destinations.forEach((d) => (cityMap[d.city] = d._id));

    // 3. Initialize Hotels
    this.hotels = hotelsData.map((h, idx) => ({
      _id: `hotel_${idx + 1}`,
      ...h,
      managerId: manager ? manager._id : 'user_2',
      destinationId: cityMap[h.city] || null,
      isActive: true,
      createdAt: new Date(),
    }));

    // 4. Initialize Rooms
    let roomIdx = 1;
    this.rooms = [];
    for (const h of this.hotels) {
      for (const tpl of roomTemplates) {
        this.rooms.push({
          _id: `room_${roomIdx++}`,
          hotelId: h._id,
          roomType: tpl.roomType,
          description: tpl.description,
          pricePerNight: Math.round(h.priceStartingFrom * tpl.priceMultiplier),
          capacity: tpl.capacity,
          bedType: tpl.bedType,
          totalRooms: tpl.totalRooms,
          amenities: tpl.amenities,
          images: tpl.images,
          isAvailable: true,
          createdAt: new Date(),
        });
      }
    }

    // 5. Initialize Reviews
    this.reviews = [
      {
        _id: 'rev_1',
        touristId: tourist ? tourist._id : 'user_1',
        targetType: 'Hotel',
        hotelId: this.hotels[0]._id,
        rating: 5,
        title: 'Outstanding Coastal Luxury',
        comment: 'The private beach access, infinity pool, and breakfast spread were simply unforgettable!',
        createdAt: new Date(),
      },
      {
        _id: 'rev_2',
        touristId: tourist ? tourist._id : 'user_1',
        targetType: 'Destination',
        destinationId: this.destinations[0]._id,
        rating: 5,
        title: 'Vibrant Beaches & Culture',
        comment: 'Loved the blend of serene churches and sunset beaches. Renting a scooter is a must.',
        createdAt: new Date(),
      },
      {
        _id: 'rev_3',
        touristId: tourist ? tourist._id : 'user_1',
        targetType: 'Hotel',
        hotelId: this.hotels[2]._id,
        rating: 5,
        title: 'Royal Rajasthani Treatment',
        comment: 'Felt like royalty from check-in to checkout. The palace architecture and dining were 10/10.',
        createdAt: new Date(),
      },
    ];

    console.log('⚡ In-Memory Fallback Database initialized with realistic seed records.');
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
