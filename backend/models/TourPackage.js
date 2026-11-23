import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 1, validate: Number.isInteger },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true }
}, { _id: false });

const tourPackageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  destination: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  pricePerTraveler: { type: Number, required: true, min: 0 },
  durationDays: { type: Number, required: true, min: 1, validate: Number.isInteger },
  itinerary: { type: [itineraryItemSchema], default: [] },
  facilities: { type: [{ type: String, trim: true }], default: [] },
  imageUrl: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

tourPackageSchema.index({ active: 1, destination: 1 });
export default mongoose.model('TourPackage', tourPackageSchema);
