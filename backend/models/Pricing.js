import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      enum: ['Car', 'Motorcycle', 'Van', 'Truck'],
      required: [true, 'Vehicle type is required'],
      unique: true,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Rate cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Pricing || mongoose.model('Pricing', pricingSchema);
