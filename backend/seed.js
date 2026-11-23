import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Hotel.deleteMany({}), Room.deleteMany({})]);
const hash = await bcrypt.hash('Admin123!', 12);
const [admin, provider, customer] = await User.create([
  { name: 'Demo Admin', email: 'admin@stayeasy.test', password: hash, role: 'admin' },
  { name: 'Demo Provider', email: 'provider@stayeasy.test', password: await bcrypt.hash('Provider123!',12), role: 'provider' },
  { name: 'Demo Customer', email: 'customer@stayeasy.test', password: await bcrypt.hash('Customer123!',12), role: 'customer' }
]);
const hotel = await Hotel.create({
  name: 'The Palm Residency', description: 'A comfortable city stay with warm hospitality and modern amenities.',
  city: 'Gurugram', address: 'Golf Course Road, Gurugram, Haryana', amenities: ['Wi-Fi','Pool','Restaurant','Parking'],
  imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', manager: provider._id
});
await Room.create([
  { hotel: hotel._id, name: 'Deluxe King', description: 'Spacious room with king bed and city view.', pricePerNight: 4200, capacity: 2, totalRooms: 8, amenities: ['Wi-Fi','Air conditioning','TV'], imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900' },
  { hotel: hotel._id, name: 'Family Suite', description: 'Large suite for a family stay.', pricePerNight: 6800, capacity: 4, totalRooms: 4, amenities: ['Wi-Fi','Living area','Mini fridge'], imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900' }
]);
console.log('Seed complete. Demo accounts: admin@stayeasy.test / Admin123!, provider@stayeasy.test / Provider123!, customer@stayeasy.test / Customer123!');
await mongoose.disconnect();
