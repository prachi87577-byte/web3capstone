import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

export const createBooking = async (req, res) => {
  const { roomId, checkIn, checkOut, guests, roomsBooked = 1 } = req.body;
  const start = new Date(checkIn), end = new Date(checkOut);
  if (!roomId || !checkIn || !checkOut || !(start < end) || start < new Date(new Date().setHours(0,0,0,0)))
    return res.status(400).json({ message: 'Choose a valid future check-in and check-out date' });
  const room = await Room.findById(roomId);
  if (!room || room.active === false) return res.status(404).json({ message: 'Room type not found or inactive' });
  if (Number(guests) < 1 || Number(guests) > room.capacity * Number(roomsBooked) || Number(roomsBooked) < 1)
    return res.status(400).json({ message: 'Guest count exceeds selected room capacity' });
  const hotel = await Hotel.findById(room.hotel);
  if (!hotel?.active) return res.status(400).json({ message: 'Hotel is not accepting bookings' });
  const clashes = await Booking.find({ room: room._id, status: 'confirmed', checkIn: { $lt: end }, checkOut: { $gt: start } });
  const booked = clashes.reduce((sum, b) => sum + b.roomsBooked, 0);
  if (booked + Number(roomsBooked) > room.totalRooms) return res.status(409).json({ message: 'Not enough rooms available for those dates' });
  const nights = Math.ceil((end - start) / 86400000);
  const booking = await Booking.create({
    guest: req.user._id, hotel: hotel._id, room: room._id, checkIn: start, checkOut: end,
    guests: Number(guests), roomsBooked: Number(roomsBooked), nights,
    totalPrice: nights * room.pricePerNight * Number(roomsBooked),
    bookingCode: `ST-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  });
  res.status(201).json({ booking: await booking.populate('hotel room') });
};
export const myBookings = async (req, res) => {
  const bookings = await Booking.find({ guest: req.user._id }).populate('hotel room').sort({ createdAt: -1 });
  res.json({ bookings });
};
export const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('hotel room guest', 'name email city address imageUrl');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (req.user.role !== 'admin' && booking.guest._id.toString() !== req.user._id.toString() &&
      (req.user.role !== 'provider' || booking.hotel.manager?.toString() !== req.user._id.toString()))
    return res.status(403).json({ message: 'Forbidden' });
  res.json({ booking });
};
export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.guest.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'You cannot cancel this booking' });
  if (booking.status !== 'confirmed') return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
  if (booking.checkIn <= new Date()) return res.status(400).json({ message: 'A stay that has started cannot be cancelled online' });
  booking.status = 'cancelled'; await booking.save(); res.json({ message: 'Booking cancelled', booking });
};
export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid booking status' });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = status;
  await booking.save();
  res.json({ booking });
};
