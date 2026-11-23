import { Router } from 'express';
import { createTourBooking, myTourBookings, updateTourBookingStatus } from '../controllers/tourController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const r = Router();
r.post('/', protect, allowRoles('customer'), asyncHandler(createTourBooking));
r.get('/my', protect, allowRoles('customer'), asyncHandler(myTourBookings));
r.patch('/admin/:id', protect, allowRoles('admin'), asyncHandler(updateTourBookingStatus));
export default r;
