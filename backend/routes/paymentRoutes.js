import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.route('/')
  .get(getPayments)
  .post(createPayment);

router.route('/:id')
  .get(getPaymentById);

export default router;
