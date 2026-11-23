import { Router } from 'express';
import { managerReport, adminReport } from '../controllers/reportController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
const r = Router();
r.get('/manager', protect, allowRoles('provider','admin'), asyncHandler(managerReport));
r.get('/admin', protect, allowRoles('admin'), asyncHandler(adminReport));
export default r;
