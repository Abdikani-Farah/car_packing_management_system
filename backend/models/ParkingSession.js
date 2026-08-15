import mongoose from 'mongoose';

const parkingSessionSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    parkingSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpace',
      required: [true, 'Parking Space is required'],
    },
    entryTime: {
      type: Date,
      required: [true, 'Entry time is required'],
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // duration in hours
      default: 0,
    },
    amount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ParkingSession || mongoose.model('ParkingSession', parkingSessionSchema);
