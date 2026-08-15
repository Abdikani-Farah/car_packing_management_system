import mongoose from 'mongoose';

const parkingSpaceSchema = new mongoose.Schema(
  {
    spaceNumber: {
      type: String,
      required: [true, 'Space number is required'],
      unique: true,
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Floor location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Car', 'Motorcycle', 'Van', 'Truck', 'VIP', 'Disabled'],
      default: 'Car',
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'],
      default: 'Available',
      required: true,
    },
    currentVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ParkingSpace || mongoose.model('ParkingSpace', parkingSpaceSchema);
