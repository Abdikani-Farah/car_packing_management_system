import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    parkingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSession',
      required: [true, 'Parking session is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Mobile Money'],
      default: 'Cash',
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
