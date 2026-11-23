import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';
export const managerReport = async (req, res) => {
  const hotels = await Hotel.find({ manager: req.user._id }).select('_id name');
  const ids = hotels.map(h => h._id);
  const [revenue, bookings] = await Promise.all([
    Booking.aggregate([
      { $match: { hotel: { $in: ids }, status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$hotel', revenue: { $sum: '$totalPrice' }, bookings: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]),
    Booking.countDocuments({ hotel: { $in: ids } })
  ]);
  res.json({ hotels, totalBookings: bookings, revenueByHotel: revenue });
};
export const adminReport = async (_req, res) => {
  const [users, hotels, bookings, revenue] = await Promise.all([
    (await import('../models/User.js')).default.countDocuments(),
    Hotel.countDocuments({ active: true }),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ])
  ]);
  res.json({ users, hotels, bookings, totalRevenue: revenue[0]?.total || 0 });
};
