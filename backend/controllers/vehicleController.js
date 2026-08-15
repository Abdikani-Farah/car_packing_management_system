import Vehicle from '../models/Vehicle.js';
import ParkingSession from '../models/ParkingSession.js';

// GET /api/vehicles
export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

// GET /api/vehicles/:id
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// POST /api/vehicles
export const createVehicle = async (req, res, next) => {
  try {
    const { plateNumber, type, model, color, ownerName, ownerPhone } = req.body;

    if (!plateNumber) {
      res.status(400);
      throw new Error('Plate number is required');
    }

    const formattedPlate = plateNumber.trim().toUpperCase();
    const existingVehicle = await Vehicle.findOne({ plateNumber: formattedPlate });
    if (existingVehicle) {
      res.status(400);
      throw new Error(`Vehicle with plate number '${formattedPlate}' already exists`);
    }

    const vehicle = await Vehicle.create({
      plateNumber: formattedPlate,
      type: type || 'Car',
      model: model || '',
      color: color || '',
      ownerName: ownerName || '',
      ownerPhone: ownerPhone || '',
    });

    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    if (req.body.plateNumber) {
      const formattedPlate = req.body.plateNumber.trim().toUpperCase();
      if (formattedPlate !== vehicle.plateNumber) {
        const existingVehicle = await Vehicle.findOne({ plateNumber: formattedPlate });
        if (existingVehicle) {
          res.status(400);
          throw new Error(`Vehicle with plate number '${formattedPlate}' already exists`);
        }
        vehicle.plateNumber = formattedPlate;
      }
    }

    vehicle.type = req.body.type || vehicle.type;
    vehicle.model = req.body.model !== undefined ? req.body.model : vehicle.model;
    vehicle.color = req.body.color !== undefined ? req.body.color : vehicle.color;
    vehicle.ownerName = req.body.ownerName !== undefined ? req.body.ownerName : vehicle.ownerName;
    vehicle.ownerPhone = req.body.ownerPhone !== undefined ? req.body.ownerPhone : vehicle.ownerPhone;

    const updatedVehicle = await vehicle.save();
    res.status(200).json(updatedVehicle);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      res.status(404);
      throw new Error('Vehicle not found');
    }

    // Rule 10: Deleting a vehicle with an active parking session should not be allowed.
    const activeSession = await ParkingSession.findOne({
      vehicle: vehicle._id,
      status: 'Active',
    });

    if (activeSession) {
      res.status(400);
      throw new Error('Cannot delete vehicle with an active parking session.');
    }

    await vehicle.deleteOne();
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};
