import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['Car', 'Motorcycle', 'Van', 'Truck'],
      required: [true, 'Vehicle type is required'],
      default: 'Car',
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    color: {
      type: String,
      trim: true,
      default: '',
    },
    ownerName: {
      type: String,
      trim: true,
      default: '',
    },
    ownerPhone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
