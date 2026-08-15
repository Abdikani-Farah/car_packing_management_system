import Payment from '../models/Payment.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../store/memoryStore.js';

// GET /api/payments
export const getPayments = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(memoryStore.payments);
    }

    const payments = await Payment.find()
      .populate({
        path: 'parkingSession',
        populate: [
          { path: 'vehicle' },
          { path: 'parkingSpace' }
        ]
      })
      .populate('vehicle')
      .populate('customer')
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/:id
export const getPaymentById = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      const payment = memoryStore.payments.find((p) => p._id === req.params.id);
      if (!payment) {
        res.status(404);
        throw new Error('Payment record not found');
      }
      return res.status(200).json(payment);
    }

    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'parkingSession',
        populate: [{ path: 'vehicle' }, { path: 'parkingSpace' }]
      })
      .populate('vehicle')
      .populate('customer');

    if (!payment) {
      res.status(404);
      throw new Error('Payment record not found');
    }

    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};

// POST /api/payments
export const createPayment = async (req, res, next) => {
  try {
    const { parkingSessionId, vehicleId, customerId, amount, paymentMethod, status } = req.body;

    if (!parkingSessionId || amount === undefined) {
      res.status(400);
      throw new Error('Parking session ID and amount are required');
    }

    if (!isDbConnected()) {
      const payment = {
        _id: `pay-${Date.now()}`,
        parkingSession: parkingSessionId,
        vehicle: vehicleId || null,
        customer: customerId || null,
        amount: Number(amount),
        paymentMethod: paymentMethod || 'Cash',
        paymentStatus: status || 'completed',
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      memoryStore.payments.push(payment);
      return res.status(201).json(payment);
    }

    const payment = await Payment.create({
      parkingSession: parkingSessionId,
      vehicle: vehicleId || null,
      customer: customerId || null,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Cash',
      status: status || 'Paid',
    });

    const populated = await Payment.findById(payment._id)
      .populate({
        path: 'parkingSession',
        populate: [{ path: 'vehicle' }, { path: 'parkingSpace' }]
      })
      .populate('vehicle')
      .populate('customer');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};
