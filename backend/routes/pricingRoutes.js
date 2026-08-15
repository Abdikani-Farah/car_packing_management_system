import express from 'express';
import {
  getPricing,
  updatePricing,
} from '../controllers/pricingController.js';

const router = express.Router();

router.route('/')
  .get(getPricing);

router.route('/:id')
  .put(updatePricing);

export default router;
