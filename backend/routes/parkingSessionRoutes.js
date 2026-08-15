import express from 'express';
import {
  getParkingSessions,
  getParkingSessionById,
  registerEntry,
  registerExit,
} from '../controllers/parkingSessionController.js';

const router = express.Router();

router.route('/')
  .get(getParkingSessions);

router.post('/entry', registerEntry);
router.put('/:id/exit', registerExit);

router.route('/:id')
  .get(getParkingSessionById);

export default router;
