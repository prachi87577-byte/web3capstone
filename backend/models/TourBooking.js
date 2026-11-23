import mongoose from 'mongoose';

const tourBookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tourPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage', required: true },
  packageName: { type: String, required: true },
  destination: { type: String, required: true },
  travelDate: { type: Date, required: true },
  travelers: { type: Number, required: true, min: 1, validate: Number.isInteger },
  durationDays: { type: Number, required: true, min: 1, validate: Number.isInteger },
  pricePerTraveler: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });

tourBookingSchema.index({ customer: 1, createdAt: -1 });
tourBookingSchema.index({ tourPackage: 1, travelDate: 1, status: 1 });
export default mongoose.model('TourBooking', tourBookingSchema);
