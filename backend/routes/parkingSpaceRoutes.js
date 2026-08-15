import express from 'express';
import {
  getParkingSpaces,
  getParkingSpaceById,
  createParkingSpace,
  updateParkingSpace,
  deleteParkingSpace,
} from '../controllers/parkingSpaceController.js';

const router = express.Router();

router.route('/')
  .get(getParkingSpaces)
  .post(createParkingSpace);

router.route('/:id')
  .get(getParkingSpaceById)
  .put(updateParkingSpace)
  .delete(deleteParkingSpace);

export default router;
