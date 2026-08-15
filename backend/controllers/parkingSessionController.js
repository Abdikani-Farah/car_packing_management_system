import ParkingSession from '../models/ParkingSession.js';
import ParkingSpace from '../models/ParkingSpace.js';
import Vehicle from '../models/Vehicle.js';
import Customer from '../models/Customer.js';
import Pricing from '../models/Pricing.js';
import Payment from '../models/Payment.js';

// GET /api/parking-sessions
export const getParkingSessions = async (req, res, next) => {
  try {
    const { status, vehicle, space } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicle) query.vehicle = vehicle;
    if (space) query.parkingSpace = space;

    const sessions = await ParkingSession.find(query)
      .populate('vehicle')
      .populate('customer')
      .populate('parkingSpace')
      .sort({ createdAt: -1 });

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// GET /api/parking-sessions/:id
export const getParkingSessionById = async (req, res, next) => {
  try {
    const session = await ParkingSession.findById(req.params.id)
      .populate('vehicle')
      .populate('customer')
      .populate('parkingSpace');

    if (!session) {
      res.status(404);
      throw new Error('Parking session not found');
    }

    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};

// POST /api/parking-sessions/entry
export const registerEntry = async (req, res, next) => {
  try {
    const { vehicleId, parkingSpaceId, customerId, entryTime, vehicleType, plateNumber } = req.body;

    let targetVehicle = null;

    // 1. Resolve or create vehicle if plateNumber is given
    if (vehicleId) {
      targetVehicle = await Vehicle.findById(vehicleId);
      if (!targetVehicle) {
        res.status(404);
        throw new Error('Vehicle not found');
      }
    } else if (plateNumber) {
      const formattedPlate = plateNumber.trim().toUpperCase();
      targetVehicle = await Vehicle.findOne({ plateNumber: formattedPlate });
      if (!targetVehicle) {
        targetVehicle = await Vehicle.create({
          plateNumber: formattedPlate,
          type: vehicleType || 'Car',
        });
      }
    } else {
      res.status(400);
      throw new Error('Vehicle information (vehicleId or plateNumber) is required');
    }

    if (!parkingSpaceId) {
      res.status(400);
      throw new Error('Parking space selection is required');
    }

    // Rule 2: A vehicle cannot have multiple active parking sessions.
    const activeSession = await ParkingSession.findOne({
      vehicle: targetVehicle._id,
      status: 'Active',
    });

    if (activeSession) {
      res.status(400);
      throw new Error(`Vehicle ${targetVehicle.plateNumber} already has an active parking session.`);
    }

    // Rule 1: Check parking space availability
    const space = await ParkingSpace.findById(parkingSpaceId);
    if (!space) {
      res.status(404);
      throw new Error('Parking space not found');
    }

    if (space.status !== 'Available') {
      res.status(400);
      throw new Error(`Parking space ${space.spaceNumber} is currently ${space.status.toLowerCase()}`);
    }

    // Rule 3: Entry time must be set
    const sessionEntryTime = entryTime ? new Date(entryTime) : new Date();

    // Create session
    const session = await ParkingSession.create({
      vehicle: targetVehicle._id,
      customer: customerId || null,
      parkingSpace: space._id,
      entryTime: sessionEntryTime,
      status: 'Active',
    });

    // Rule 5: When vehicle enters: Space = Occupied
    space.status = 'Occupied';
    space.currentVehicle = targetVehicle._id;
    await space.save();

    const populatedSession = await ParkingSession.findById(session._id)
      .populate('vehicle')
      .populate('customer')
      .populate('parkingSpace');

    res.status(201).json(populatedSession);
  } catch (error) {
    next(error);
  }
};

// PUT /api/parking-sessions/:id/exit
export const registerExit = async (req, res, next) => {
  try {
    const session = await ParkingSession.findById(req.params.id)
      .populate('vehicle')
      .populate('parkingSpace');

    if (!session) {
      res.status(404);
      throw new Error('Parking session not found');
    }

    if (session.status === 'Completed') {
      res.status(400);
      throw new Error('This parking session has already ended.');
    }

    const { exitTime, paymentMethod } = req.body;
    const sessionExitTime = exitTime ? new Date(exitTime) : new Date();

    // Rule 4: Exit cannot happen before entry
    if (sessionExitTime < new Date(session.entryTime)) {
      res.status(400);
      throw new Error('Exit time cannot be earlier than entry time');
    }

    // Rule 7: Calculate fee automatically based on duration and vehicle rate
    const diffInMs = sessionExitTime.getTime() - new Date(session.entryTime).getTime();
    const diffInHours = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60))); // Minimum 1 hour charge

    const vehicleType = session.vehicle ? session.vehicle.type : 'Car';
    const pricing = await Pricing.findOne({ vehicleType });
    const hourlyRate = pricing ? pricing.hourlyRate : 2; // Default fallback $2

    const totalAmount = diffInHours * hourlyRate;

    session.exitTime = sessionExitTime;
    session.duration = diffInHours;
    session.amount = totalAmount;
    session.status = 'Completed';
    await session.save();

    // Create payment record
    const payment = await Payment.create({
      parkingSession: session._id,
      vehicle: session.vehicle ? session.vehicle._id : null,
      customer: session.customer || null,
      amount: totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      status: 'Paid',
    });

    // Rule 6: When vehicle exits: Space = Available
    if (session.parkingSpace) {
      const space = await ParkingSpace.findById(session.parkingSpace._id);
      if (space) {
        space.status = 'Available';
        space.currentVehicle = null;
        await space.save();
      }
    }

    const populatedSession = await ParkingSession.findById(session._id)
      .populate('vehicle')
      .populate('customer')
      .populate('parkingSpace');

    res.status(200).json({
      session: populatedSession,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
