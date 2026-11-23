import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
const owns = (hotel, user) => user.role === 'admin' || hotel.manager.toString() === user._id.toString();
export const createRoom = async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
  if (!owns(hotel, req.user)) return res.status(403).json({ message: 'Not your hotel' });
  const room = await Room.create({ ...req.body, hotel: hotel._id });
  res.status(201).json({ room });
};
export const updateRoom = async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!owns(room.hotel, req.user)) return res.status(403).json({ message: 'Not your hotel' });
  Object.assign(room, req.body); await room.save(); res.json({ room });
};
export const deleteRoom = async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (!owns(room.hotel, req.user)) return res.status(403).json({ message: 'Not your hotel' });
  room.active = false;
  await room.save();
  res.json({ message: 'Room type deactivated' });
};
