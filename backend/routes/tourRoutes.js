import { Router } from 'express';
import {
  listTourPackages, myTourPackages, getTourPackage, createTourPackage,
  updateTourPackage, deactivateTourPackage
} from '../controllers/tourController.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const r = Router();
r.get('/', asyncHandler(listTourPackages));
r.get('/mine', protect, allowRoles('provider'), asyncHandler(myTourPackages));
r.get('/:id', asyncHandler(getTourPackage));
r.post('/', protect, allowRoles('provider', 'admin'), asyncHandler(createTourPackage));
r.patch('/:id', protect, allowRoles('provider', 'admin'), asyncHandler(updateTourPackage));
r.delete('/:id', protect, allowRoles('provider', 'admin'), asyncHandler(deactivateTourPackage));
export default r;
