import { Router } from 'express';
import { adminDashboard, updateAdminUser } from '../controllers/adminController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const r = Router();
r.use(protect, allowRoles('admin'));
r.get('/dashboard', asyncHandler(adminDashboard));
r.patch('/users/:id', asyncHandler(updateAdminUser));
export default r;
