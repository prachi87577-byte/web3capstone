import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import TourPackage from '../models/TourPackage.js';
import TourBooking from '../models/TourBooking.js';

export const adminDashboard = async (_req, res) => {
  const [users, hotels, rooms, bookings, tourPackages, tourBookings] = await Promise.all([
    User.find().select('name email role active createdAt').sort({ createdAt: -1 }),
    Hotel.find().populate('manager', 'name email role active').sort({ createdAt: -1 }),
    Room.find().populate('hotel', 'name').sort({ createdAt: -1 }),
    Booking.find().populate('guest', 'name email').populate('hotel', 'name').populate('room', 'name').sort({ createdAt: -1 }),
    TourPackage.find().populate('provider', 'name email role active').sort({ createdAt: -1 }),
    TourBooking.find().populate('customer', 'name email').sort({ createdAt: -1 })
  ]);
  const roleCount = role => users.filter(user => user.role === role).length;
  const earnedStatuses = new Set(['confirmed', 'completed']);

  res.json({
    stats: {
      customers: roleCount('customer'),
      providers: roleCount('provider'),
      hotels: hotels.length,
      activeHotels: hotels.filter(hotel => hotel.active !== false).length,
      rooms: rooms.length,
      hotelBookings: bookings.length,
      tourPackages: tourPackages.length,
      activeTourPackages: tourPackages.filter(tourPackage => tourPackage.active !== false).length,
      tourBookings: tourBookings.length,
      revenue: bookings.filter(booking => earnedStatuses.has(booking.status)).reduce((sum, booking) => sum + booking.totalPrice, 0) +
        tourBookings.filter(booking => earnedStatuses.has(booking.status)).reduce((sum, booking) => sum + booking.totalPrice, 0)
    },
    users, hotels, rooms, bookings, tourPackages, tourBookings
  });
};

export const updateAdminUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Admin accounts cannot be changed here' });
  if (user._id.equals(req.user._id)) return res.status(400).json({ message: 'You cannot change your own account' });

  const { role, active } = req.body;
  if (role !== undefined && !['customer', 'provider'].includes(role)) {
    return res.status(400).json({ message: 'Role must be customer or provider' });
  }
  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({ message: 'Active status must be true or false' });
  }
  if (role === undefined && active === undefined) {
    return res.status(400).json({ message: 'Provide a role or active status to update' });
  }

  const leavesProviderRole = user.role === 'provider' &&
    ((role !== undefined && role !== 'provider') || active === false);
  if (leavesProviderRole) {
    const activeHotels = await Hotel.countDocuments({ manager: user._id, active: { $ne: false } });
    if (activeHotels) {
      return res.status(409).json({ message: 'Reassign or deactivate this provider’s hotels before changing their role or status' });
    }
  }

  if (role !== undefined) user.role = role;
  if (active !== undefined) user.active = active;
  user.tokenVersion += 1;
  await user.save();
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, active: user.active } });
};
