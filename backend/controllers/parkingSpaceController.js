import ParkingSpace from '../models/ParkingSpace.js';
import ParkingSession from '../models/ParkingSession.js';

// GET /api/parking-spaces
export const getParkingSpaces = async (req, res, next) => {
  try {
    const spaces = await ParkingSpace.find()
      .populate('currentVehicle')
      .sort({ spaceNumber: 1 });
    res.status(200).json(spaces);
  } catch (error) {
    next(error);
  }
};

// GET /api/parking-spaces/:id
export const getParkingSpaceById = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findById(req.params.id).populate('currentVehicle');
    if (!space) {
      res.status(404);
      throw new Error('Parking space not found');
    }
    res.status(200).json(space);
  } catch (error) {
    next(error);
  }
};

// POST /api/parking-spaces
export const createParkingSpace = async (req, res, next) => {
  try {
    const { spaceNumber, floor, type, status } = req.body;

    if (!spaceNumber || !floor) {
      res.status(400);
      throw new Error('Space number and floor are required');
    }

    const existingSpace = await ParkingSpace.findOne({ spaceNumber: spaceNumber.trim() });
    if (existingSpace) {
      res.status(400);
      throw new Error(`Parking space '${spaceNumber}' already exists`);
    }

    const space = await ParkingSpace.create({
      spaceNumber: spaceNumber.trim(),
      floor: floor.trim(),
      type: type || 'Car',
      status: status || 'Available',
    });

    res.status(201).json(space);
  } catch (error) {
    next(error);
  }
};

// PUT /api/parking-spaces/:id
export const updateParkingSpace = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findById(req.params.id);
    if (!space) {
      res.status(404);
      throw new Error('Parking space not found');
    }

    if (req.body.spaceNumber && req.body.spaceNumber.trim() !== space.spaceNumber) {
      const existingSpace = await ParkingSpace.findOne({ spaceNumber: req.body.spaceNumber.trim() });
      if (existingSpace) {
        res.status(400);
        throw new Error(`Parking space '${req.body.spaceNumber}' already exists`);
      }
    }

    // Rule 1 check: Cannot manually change status to Occupied without a vehicle session
    if (req.body.status === 'Occupied' && !space.currentVehicle && !req.body.currentVehicle) {
      res.status(400);
      throw new Error('Cannot set space status to Occupied without assigning an active parking session/vehicle');
    }

    space.spaceNumber = req.body.spaceNumber !== undefined ? req.body.spaceNumber.trim() : space.spaceNumber;
    space.floor = req.body.floor !== undefined ? req.body.floor.trim() : space.floor;
    space.type = req.body.type || space.type;
    space.status = req.body.status || space.status;
    if (req.body.currentVehicle !== undefined) {
      space.currentVehicle = req.body.currentVehicle;
    }

    const updatedSpace = await space.save();
    res.status(200).json(updatedSpace);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/parking-spaces/:id
export const deleteParkingSpace = async (req, res, next) => {
  try {
    const space = await ParkingSpace.findById(req.params.id);
    if (!space) {
      res.status(404);
      throw new Error('Parking space not found');
    }

    // Rule 9: Deleting an occupied parking space should not be allowed.
    if (space.status === 'Occupied' || space.currentVehicle) {
      res.status(400);
      throw new Error('Cannot delete an occupied parking space. Please process vehicle exit first.');
    }

    const activeSession = await ParkingSession.findOne({
      parkingSpace: space._id,
      status: 'Active',
    });

    if (activeSession) {
      res.status(400);
      throw new Error('Cannot delete parking space with an active parking session.');
    }

    await space.deleteOne();
    res.status(200).json({ message: 'Parking space removed successfully' });
  } catch (error) {
    next(error);
  }
};
