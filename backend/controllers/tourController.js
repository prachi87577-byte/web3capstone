import crypto from 'crypto';
import TourPackage from '../models/TourPackage.js';
import TourBooking from '../models/TourBooking.js';
import User from '../models/User.js';

const packageFields = [
  'name', 'destination', 'description', 'pricePerTraveler',
  'durationDays', 'itinerary', 'facilities', 'imageUrl', 'active'
];

const ownsPackage = (tourPackage, user) =>
  user.role === 'admin' || tourPackage.provider?.toString() === user._id.toString();

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listTourPackages = async (req, res) => {
  const filter = { active: { $ne: false } };
  const destination = String(req.query.destination || '').trim();
  if (destination) filter.destination = { $regex: escapeRegex(destination), $options: 'i' };
  const packages = await TourPackage.find(filter).populate('provider', 'name').sort({ createdAt: -1 });
  res.json({ packages });
};

export const myTourPackages = async (req, res) => {
  const packages = await TourPackage.find({ provider: req.user._id }).sort({ createdAt: -1 });
  res.json({ packages });
};

export const getTourPackage = async (req, res) => {
  const tourPackage = await TourPackage.findOne({ _id: req.params.id, active: { $ne: false } })
    .populate('provider', 'name');
  if (!tourPackage) return res.status(404).json({ message: 'Tour package not found' });
  res.json({ tourPackage });
};

export const createTourPackage = async (req, res) => {
  const data = Object.fromEntries(packageFields
    .filter(field => req.body[field] !== undefined)
    .map(field => [field, req.body[field]]));
  if (req.user.role === 'provider') {
    data.provider = req.user._id;
  } else if (req.body.provider) {
    const provider = await User.findOne({
      _id: req.body.provider, role: 'provider', active: { $ne: false }
    });
    if (!provider) return res.status(400).json({ message: 'Choose an active provider for this tour package' });
    data.provider = provider._id;
  } else {
    data.provider = null;
  }
  const tourPackage = await TourPackage.create(data);
  res.status(201).json({ tourPackage });
};

export const updateTourPackage = async (req, res) => {
  const tourPackage = await TourPackage.findById(req.params.id);
  if (!tourPackage) return res.status(404).json({ message: 'Tour package not found' });
  if (!ownsPackage(tourPackage, req.user)) return res.status(403).json({ message: 'You cannot manage this tour package' });
  if (req.user.role !== 'admin' && req.body.provider !== undefined) {
    return res.status(403).json({ message: 'Only admins can reassign a tour package' });
  }
  for (const field of packageFields) {
    if (req.body[field] !== undefined) tourPackage[field] = req.body[field];
  }
  if (req.user.role === 'admin' && req.body.provider !== undefined) {
    if (req.body.provider) {
      const provider = await User.findOne({
        _id: req.body.provider, role: 'provider', active: { $ne: false }
      });
      if (!provider) return res.status(400).json({ message: 'Choose an active provider for this tour package' });
      tourPackage.provider = provider._id;
    } else {
      tourPackage.provider = null;
    }
  }
  await tourPackage.save();
  res.json({ tourPackage });
};

export const deactivateTourPackage = async (req, res) => {
  const tourPackage = await TourPackage.findById(req.params.id);
  if (!tourPackage) return res.status(404).json({ message: 'Tour package not found' });
  if (!ownsPackage(tourPackage, req.user)) return res.status(403).json({ message: 'You cannot manage this tour package' });
  tourPackage.active = false;
  await tourPackage.save();
  res.json({ tourPackage });
};

export const createTourBooking = async (req, res) => {
  const { packageId, travelDate } = req.body;
  const travelers = Number(req.body.travelers);
  const date = new Date(travelDate);
  const travelDay = Number.isNaN(+date) ? '' : date.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  if (!packageId || !travelDate || !travelDay ||
      travelDay < today || !Number.isInteger(travelers) || travelers < 1) {
    return res.status(400).json({ message: 'Choose a future travel date and at least one traveler' });
  }

  const tourPackage = await TourPackage.findOne({ _id: packageId, active: { $ne: false } });
  if (!tourPackage) return res.status(404).json({ message: 'Tour package not found or inactive' });

  const booking = await TourBooking.create({
    customer: req.user._id,
    tourPackage: tourPackage._id,
    packageName: tourPackage.name,
    destination: tourPackage.destination,
    travelDate: date,
    travelers,
    durationDays: tourPackage.durationDays,
    pricePerTraveler: tourPackage.pricePerTraveler,
    totalPrice: tourPackage.pricePerTraveler * travelers,
    bookingCode: `TP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  });
  res.status(201).json({ booking });
};

export const myTourBookings = async (req, res) => {
  const bookings = await TourBooking.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ bookings });
};

export const updateTourBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid tour booking status' });
  }
  const booking = await TourBooking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Tour booking not found' });
  booking.status = status;
  await booking.save();
  res.json({ booking });
};
