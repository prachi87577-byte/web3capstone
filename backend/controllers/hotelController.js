import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const listHotels = async (req, res) => {
  const { city, location, guests, checkIn, checkOut } = req.query;
  const filter = { active: true };
  if (city || location) { const term = city || location; filter.$or = ['city','state','locality','address'].map(field => ({ [field]: { $regex: term, $options: 'i' } })); }
  const hotels = await Hotel.find(filter).populate('manager', 'name');
  const results = [];
  for (const hotel of hotels) {
    let rooms = await Room.find({ hotel: hotel._id, active: { $ne: false }, ...(guests ? { capacity: { $gte: Number(guests) } } : {}) });
    if (checkIn && checkOut) {
      const start = new Date(checkIn), end = new Date(checkOut);
      if (!(start < end) || Number.isNaN(+start) || Number.isNaN(+end)) return res.status(400).json({ message: 'Invalid date range' });
      const available = [];
      for (const room of rooms) {
        const clashes = await Booking.find({ room: room._id, status: 'confirmed', checkIn: { $lt: end }, checkOut: { $gt: start } });
        const booked = clashes.reduce((sum, b) => sum + b.roomsBooked, 0);
        if (room.totalRooms - booked > 0) available.push({ ...room.toObject(), availableRooms: room.totalRooms - booked });
      }
      rooms = available;
    }
    if (rooms.length) results.push({ ...hotel.toObject(), rooms });
  }
  res.json({ hotels: results });
};
export const myHotels = async (req, res) => { const hotels = await Hotel.find({ manager: req.user._id, active: true }); res.json({ hotels }); };
export const getHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel || hotel.active === false) return res.status(404).json({ message: 'Hotel not found' });
  let rooms = await Room.find({ hotel: hotel._id, active: { $ne: false } });
  const { checkIn, checkOut } = req.query;
  if (checkIn && checkOut) { const start = new Date(checkIn), end = new Date(checkOut); if (!(start < end)) return res.status(400).json({ message: 'Invalid date range' }); const available=[]; for (const room of rooms) { const clashes=await Booking.find({ room: room._id, status:'confirmed', checkIn:{ $lt:end }, checkOut:{ $gt:start } }); const booked=clashes.reduce((sum,b)=>sum+b.roomsBooked,0); const availableRooms=room.totalRooms-booked; if (availableRooms>0) available.push({ ...room.toObject(), availableRooms }); } rooms=available; }
  res.json({ hotel, rooms });
};
export const createHotel = async (req, res) => {
  if (req.user.role === 'admin' && !req.body.manager) {
    return res.status(400).json({ message: 'Choose a provider to manage this hotel' });
  }
  const managerId = req.user.role === 'admin' ? req.body.manager : req.user._id;
  if (req.user.role === 'admin') {
    const manager = await User.findOne({ _id: managerId, role: 'provider', active: { $ne: false } });
    if (!manager) return res.status(400).json({ message: 'Choose an active provider to manage this hotel' });
  }
  const hotel = await Hotel.create({ ...req.body, manager: managerId });
  res.status(201).json({ hotel });
};
export const updateHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
  if (req.user.role !== 'admin' && hotel.manager.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your hotel' });
  if (req.body.manager !== undefined) {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can reassign a hotel' });
    const manager = await User.findOne({ _id: req.body.manager, role: 'provider', active: { $ne: false } });
    if (!manager) return res.status(400).json({ message: 'Choose an active provider to manage this hotel' });
  }
  Object.assign(hotel, req.body); await hotel.save(); res.json({ hotel });
};
export const deleteHotel = async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
  if (req.user.role !== 'admin' && hotel.manager.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your hotel' });
  hotel.active = false; await hotel.save(); res.json({ message: 'Hotel deactivated' });
};
