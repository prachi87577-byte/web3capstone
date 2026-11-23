import mongoose from 'mongoose';
const roomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  pricePerNight: { type: Number, required: true, min: 1 },
  capacity: { type: Number, required: true, min: 1 },
  totalRooms: { type: Number, required: true, min: 1 },
  amenities: [{ type: String }],
  imageUrl: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });
roomSchema.index({ hotel: 1, pricePerNight: 1 });
export default mongoose.model('Room', roomSchema);
