import { Router } from 'express';
import { createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const r = Router();
r.post('/hotel/:hotelId', protect, allowRoles('provider','admin'), asyncHandler(createRoom));
r.patch('/:id', protect, allowRoles('provider','admin'), asyncHandler(updateRoom));
r.delete('/:id', protect, allowRoles('provider','admin'), asyncHandler(deleteRoom));
export default r;
