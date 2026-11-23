import mongoose from 'mongoose';
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  city: { type: String, required: true, trim: true, index: true },
  state: { type: String, default: '', trim: true },
  country: { type: String, default: 'India', trim: true },
  locality: { type: String, default: '', trim: true },
  address: { type: String, required: true },
  amenities: [{ type: String, trim: true }],
  imageUrl: { type: String, default: '' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });
hotelSchema.index({ city: 1, active: 1 });
export default mongoose.model('Hotel', hotelSchema);
