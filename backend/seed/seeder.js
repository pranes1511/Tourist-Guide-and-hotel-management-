import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { User, Destination, Hotel, Room, Booking, Payment, Review } from '../models/index.js';
import { usersData, destinationsData, hotelsData, roomTemplates } from './seedData.js';

dotenv.config();

export const seedDatabase = async ({ fresh = false } = {}) => {
  try {
    console.log('🌱 Starting Database Seeding Process...');

    if (fresh) {
      // Clear existing data only if explicitly requested
      await Promise.all([
        User.deleteMany(),
        Destination.deleteMany(),
        Hotel.deleteMany(),
        Room.deleteMany(),
        Booking.deleteMany(),
        Payment.deleteMany(),
        Review.deleteMany(),
      ]);
      console.log('🧹 Cleared all existing database collections (Fresh Mode).');
    }

    // 1. Insert or preserve Users
    const createdUsers = [];
    for (const u of usersData) {
      let existingUser = await User.findOne({ email: u.email.toLowerCase() });
      if (!existingUser) {
        existingUser = new User(u);
        await existingUser.save();
        console.log(`   + Created user: [${existingUser.role.toUpperCase()}] ${existingUser.email}`);
      } else {
        console.log(`   = Preserved user: [${existingUser.role.toUpperCase()}] ${existingUser.email}`);
      }
      createdUsers.push(existingUser);
    }

    const managerUser = createdUsers.find((u) => u.role === 'manager') || createdUsers[0];
    const touristUser = createdUsers.find((u) => u.role === 'tourist') || createdUsers[0];

    // 2. Insert or update Destinations (Upsert by name to prevent duplicates)
    const createdDestinations = [];
    for (const d of destinationsData) {
      const destDoc = await Destination.findOneAndUpdate(
        { name: d.name },
        { $set: d },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdDestinations.push(destDoc);
    }
    console.log(`📍 Seeded/Preserved ${createdDestinations.length} Destinations without duplicates.`);

    // Map destinations by city
    const destinationMap = {};
    createdDestinations.forEach((d) => {
      destinationMap[d.city] = d._id;
    });

    // 3. Insert or update Hotels
    const createdHotels = [];
    for (const hotel of hotelsData) {
      const hotelData = {
        ...hotel,
        managerId: managerUser._id,
        destinationId: destinationMap[hotel.city] || null,
      };
      const hotelDoc = await Hotel.findOneAndUpdate(
        { name: hotel.name, city: hotel.city },
        { $set: hotelData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdHotels.push(hotelDoc);
    }
    console.log(`🏨 Seeded/Preserved ${createdHotels.length} Hotels assigned to Manager (${managerUser.name}).`);

    // 4. Insert or preserve Rooms for each hotel
    let roomsSeededCount = 0;
    for (const hotel of createdHotels) {
      for (const tpl of roomTemplates) {
        const existingRoom = await Room.findOne({ hotelId: hotel._id, roomType: tpl.roomType });
        if (!existingRoom) {
          await Room.create({
            hotelId: hotel._id,
            roomType: tpl.roomType,
            description: tpl.description,
            pricePerNight: Math.round(hotel.priceStartingFrom * tpl.priceMultiplier),
            capacity: tpl.capacity,
            bedType: tpl.bedType,
            totalRooms: tpl.totalRooms,
            amenities: tpl.amenities,
            images: tpl.images,
            isAvailable: true,
          });
          roomsSeededCount++;
        }
      }
    }
    console.log(`🛏️  Configured Room inventory (${roomsSeededCount} new rooms added).`);

    // 5. Seed sample reviews if none exist
    const existingReviewsCount = await Review.countDocuments();
    if (existingReviewsCount === 0 && createdHotels.length > 0) {
      const sampleReviews = [
        {
          touristId: touristUser._id,
          targetType: 'Hotel',
          hotelId: createdHotels[0]._id,
          rating: 5,
          title: 'Outstanding Coastal Luxury',
          comment: 'The private beach access, infinity pool, and breakfast spread were simply unforgettable!',
        },
        {
          touristId: touristUser._id,
          targetType: 'Destination',
          destinationId: createdDestinations[0]._id,
          rating: 5,
          title: 'Vibrant Beaches & Culture',
          comment: 'Loved the blend of serene churches and sunset beaches. Renting a scooter is a must.',
        },
      ];
      await Review.insertMany(sampleReviews);
      console.log(`⭐ Seeded ${sampleReviews.length} Verified Tourist Reviews.`);
    }

    console.log('✅ Database Seeding Completed Successfully without duplicates!');
    return true;
  } catch (error) {
    console.error('❌ Database Seeding Failed:', error);
    throw error;
  }
};

// If executed directly from command line: node seed/seeder.js
const runSeeder = async () => {
  await connectDB();
  try {
    if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
      await Promise.all([
        User.deleteMany(),
        Destination.deleteMany(),
        Hotel.deleteMany(),
        Room.deleteMany(),
        Booking.deleteMany(),
        Payment.deleteMany(),
        Review.deleteMany(),
      ]);
      console.log('🗑️  All database records destroyed.');
    } else {
      await seedDatabase();
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

if (process.argv[1]?.includes('seeder.js')) {
  runSeeder();
}
